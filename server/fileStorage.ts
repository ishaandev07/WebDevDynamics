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
    const filePath = path.join(this.uploadsDir, fileName);
    const extractDir = path.join(this.uploadsDir, fileName.replace('.zip', '_extracted'));

    try {
      // Create extraction directory
      await fs.promises.mkdir(extractDir, { recursive: true });

      // Extract zip file using unzip command (available in most Linux environments)
      await execAsync(`cd "${extractDir}" && unzip -q "${filePath}"`);

      // Read extracted files
      const files = await this.readDirectoryFiles(extractDir);
      
      // Clean up extraction directory after reading
      await this.removeDirectory(extractDir);

      return files;
    } catch (error) {
      throw new Error(`Failed to extract zip file: ${error.message}`);
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
            console.warn(`Could not read file ${relativePath}:`, error.message);
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
      console.warn(`Failed to remove directory ${dirPath}:`, error.message);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, fileName);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to delete file ${fileName}:`, error.message);
    }
  }

  getFilePath(fileName: string): string {
    return path.join(this.uploadsDir, fileName);
  }
}

export const fileStorage = new FileStorageService();
