import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBookingModal } from '@/hooks/use-booking';
import { 
  GraduationCap, 
  Award, 
  Heart, 
  Users,
  CheckCircle,
  Calendar
} from 'lucide-react';

const credentials = [
  {
    icon: GraduationCap,
    title: 'M.Sc. in Clinical Nutrition',
    description: 'Advanced degree in nutritional science',
  },
  {
    icon: Award,
    title: 'Certified Diabetes Educator',
    description: 'Specialized training in diabetes management',
  },
  {
    icon: CheckCircle,
    title: 'IDA Registered Dietician',
    description: 'Licensed by Indian Dietetic Association',
  },
  {
    icon: Heart,
    title: '500+ Success Stories',
    description: 'Proven track record of client transformations',
  },
];

const specializations = [
  'Weight Management & Body Composition',
  'Diabetes & Metabolic Disorders',
  'Sports & Performance Nutrition',
  'Pregnancy & Maternal Health',
  'Digestive Health & Gut Wellness',
  'Plant-Based & Sustainable Eating',
];

export function AboutSection() {
  const { openModal } = useBookingModal();

  return (
    <section id="about" className="section-padding bg-muted/30">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <img
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800"
              alt="Ishita Singh - Certified Dietician and Nutrition Expert"
              className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">Meet Ishita Singh</h2>
              <div className="flex items-center gap-2 text-lg text-primary font-semibold">
                <Award className="h-5 w-5" />
                Registered Dietician (RD)
              </div>
            </div>

            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                With over 5 years of experience in clinical nutrition and dietetics, I'm passionate about 
                helping individuals achieve their health goals through personalized nutrition strategies.
              </p>
              <p>
                My approach combines evidence-based nutritional science with practical, sustainable lifestyle 
                changes that fit into your daily routine. I believe in empowering my clients with the knowledge 
                and tools they need for long-term success.
              </p>
            </div>

            {/* Credentials */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Credentials & Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {credentials.map((credential, index) => {
                  const IconComponent = credential.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{credential.title}</div>
                        <div className="text-xs text-muted-foreground">{credential.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specializations */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Areas of Specialization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {specializations.map((specialization, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{specialization}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={() => openModal()} size="lg" className="btn-primary">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Consultation
              </Button>
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="mt-20">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <h3 className="text-3xl font-bold text-foreground">My Philosophy</h3>
                <blockquote className="text-xl text-muted-foreground italic leading-relaxed max-w-4xl mx-auto">
                  "Nutrition is not about perfection—it's about progress. Every small, sustainable change you make 
                  today brings you closer to the healthy, vibrant life you deserve. My role is to guide you on this 
                  journey with compassion, evidence-based advice, and personalized strategies that work for your 
                  unique lifestyle."
                </blockquote>
                <div className="text-primary font-semibold">— Ishita Singh, RD</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
