import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export interface FileInfo {
  name: string;
  content: string;
  size: number;
}

export class FileStorageService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDir();
  }

  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveUploadedFile(fileName: string, buffer: Buffer): Promise<string> {
    const uniqueFileName = `${Date.now()}_${fileName}`;
    const filePath = path.join(this.uploadsDir, uniqueFileName);
    
    await fs.promises.writeFile(filePath, buffer);
    return uniqueFileName;
  }

  async extractZipContents(fileName: string): Promise<FileInfo[]> {
    // Handle both absolute paths and relative file names
    const filePath = fileName.includes('/') ? fileName : path.join(this.uploadsDir, fileName);
    
    try {
      // Check if it's a directory (folder upload) or file (ZIP upload)
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isDirectory()) {
        console.log(`Processing folder upload: ${fileName}`);
        // Read files directly from the folder
        const files = await this.readDirectoryFiles(filePath);
        console.log(`Successfully read ${files.length} files from folder ${fileName}`);
        return files;
      } else if (stats.isFile()) {
        console.log(`Processing ZIP file: ${fileName}`);
        // Handle ZIP file extraction
        const extractDir = path.join(this.uploadsDir, fileName.replace('.zip', '_extracted'));
        
        try {
          // Create extraction directory
          await fs.promises.mkdir(extractDir, { recursive: true });
          
          console.log(`Extracting ${filePath} to ${extractDir}`);

          // Extract zip file using unzip command
          try {
            await execAsync(`unzip -q "${filePath}" -d "${extractDir}"`);
          } catch (unzipError: any) {
            console.error('Unzip command failed:', unzipError);
            // Try alternative extraction method
            console.log('Attempting alternative extraction...');
            await execAsync(`cd "${extractDir}" && unzip -o "${filePath}"`);
          }

          // Read extracted files
          const files = await this.readDirectoryFiles(extractDir);
          
          console.log(`Successfully extracted ${files.length} files from ZIP ${fileName}`);
          
          // Clean up extraction directory after reading
          await this.removeDirectory(extractDir);

          return files;
        } catch (error: any) {
          // Clean up on error
          try {
            await this.removeDirectory(extractDir);
          } catch (cleanupError) {
            console.error('Error cleaning up extraction directory:', cleanupError);
          }
          throw error;
        }
      } else {
        throw new Error(`Unsupported file type: ${fileName} is neither a file nor directory`);
      }
    } catch (error: any) {
      console.error('Error in extractZipContents:', error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  private async readDirectoryFiles(dirPath: string, basePath = ''): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other common directories that shouldn't be analyzed
        if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          continue;
        }
        const subFiles = await this.readDirectoryFiles(fullPath, relativePath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Only read text files for analysis
        if (this.isTextFile(entry.name)) {
          try {
            const content = await fs.promises.readFile(fullPath, 'utf-8');
            const stats = await fs.promises.stat(fullPath);
            files.push({
              name: relativePath,
              content,
              size: stats.size
            });
          } catch (error) {
            // Skip files that can't be read
            console.warn(`Could not read file ${relativePath}:`, (error as Error).message);
          }
        }
      }
    }

    return files;
  }

  private isTextFile(fileName: string): boolean {
    const textExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.php', '.rb', '.go',
      '.html', '.css', '.scss', '.sass', '.json', '.xml', '.yml', '.yaml',
      '.md', '.txt', '.sh', '.dockerfile', '.gitignore', '.env.example',
      '.sql', '.prisma', '.graphql', '.vue', '.svelte'
    ];
    
    const ext = path.extname(fileName).toLowerCase();
    return textExtensions.includes(ext) || 
           ['package.json', 'requirements.txt', 'composer.json', 'pom.xml', 'build.gradle', 'Cargo.toml'].includes(path.basename(fileName));
  }

  private async removeDirectory(dirPath: string): Promise<void> {
    try {
      await execAsync(`rm -rf "${dirPath}"`);
    } catch (error) {
      console.warn(`Failed to remove directory ${dirPath}:`, (error as Error).message);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, fileName);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to delete file ${fileName}:`, (error as Error).message);
    }
  }

  getFilePath(fileName: string): string {
    return path.join(this.uploadsDir, fileName);
  }
}

export const fileStorage = new FileStorageService();
