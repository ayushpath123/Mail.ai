"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Languages,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  X
} from "lucide-react";
import { motion } from "framer-motion";

interface CVData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  
  // Professional Summary
  summary: string;
  
  // Work Experience
  experience: Array<{
    id: string;
    company: string;
    position: string;
    duration: string;
    description: string;
    achievements: string[];
  }>;
  
  // Education
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    duration: string;
    gpa?: string;
  }>;
  
  // Skills
  technicalSkills: string[];
  softSkills: string[];
  
  // Projects
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  
  // Certifications
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }>;
  
  // Languages
  languages: Array<{
    id: string;
    language: string;
    proficiency: string;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [cvData, setCvData] = useState<CVData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    experience: [],
    education: [],
    technicalSkills: [],
    softSkills: [],
    projects: [],
    certifications: [],
    languages: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (session?.user) {
      setCvData(prev => ({
        ...prev,
        fullName: session.user?.name || "",
        email: session.user?.email || ""
      }));
      loadCVData();
    }
  }, [session]);

  const loadCVData = async () => {
    try {
      const response = await fetch('/api/backend/v2/cv-profile');
      if (response.ok) {
        const data = await response.json();
        if (data.cvData) {
          setCvData(data.cvData);
        }
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
    }
  };

  const saveCVData = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/backend/v2/cv-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvData }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'CV profile saved successfully!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save CV profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Experience functions
  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        company: "",
        position: "",
        duration: "",
        description: "",
        achievements: []
      }]
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // Education functions
  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        institution: "",
        degree: "",
        field: "",
        duration: "",
        gpa: ""
      }]
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Skills functions
  const addSkill = (type: 'technicalSkills' | 'softSkills', skill: string) => {
    if (skill.trim()) {
      setCvData(prev => ({
        ...prev,
        [type]: [...prev[type], skill.trim()]
      }));
    }
  };

  const removeSkill = (type: 'technicalSkills' | 'softSkills', index: number) => {
    setCvData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // Project functions
  const addProject = () => {
    setCvData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now().toString(),
        name: "",
        description: "",
        technologies: [],
        link: ""
      }]
    }));
  };

  const removeProject = (id: string) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const updateProject = (id: string, field: string, value: any) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }));
  };

  // Certification functions
  const addCertification = () => {
    setCvData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: Date.now().toString(),
        name: "",
        issuer: "",
        date: "",
        link: ""
      }]
    }));
  };

  const removeCertification = (id: string) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  // Language functions
  const addLanguage = () => {
    setCvData(prev => ({
      ...prev,
      languages: [...prev.languages, {
        id: Date.now().toString(),
        language: "",
        proficiency: ""
      }]
    }));
  };

  const removeLanguage = (id: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.map(lang => 
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to access your profile
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">CV Profile</h1>
              <p className="text-muted-foreground">
                Build your comprehensive CV profile for AI-powered email generation
              </p>
            </div>
            <Button onClick={saveCVData} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </motion.div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="extras">Extras</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={cvData.fullName}
                      onChange={(e) => setCvData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={cvData.email}
                      onChange={(e) => setCvData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={cvData.phone}
                      onChange={(e) => setCvData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={cvData.location}
                      onChange={(e) => setCvData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="New York, NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={cvData.linkedin}
                      onChange={(e) => setCvData(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={cvData.github}
                      onChange={(e) => setCvData(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="github.com/johndoe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolio">Portfolio</Label>
                    <Input
                      id="portfolio"
                      value={cvData.portfolio}
                      onChange={(e) => setCvData(prev => ({ ...prev, portfolio: e.target.value }))}
                      placeholder="johndoe.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={cvData.summary}
                    onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="A brief summary of your professional background, key skills, and career objectives..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                  <Button onClick={addExperience} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {cvData.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Experience {index + 1}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          placeholder="Job Title"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={exp.duration}
                        onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                        placeholder="Jan 2020 - Present"
                      />
                    </div>
                    
                    <div>
                      <Label>Description & Achievements</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your role, responsibilities, and key achievements..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                ))}
                
                {cvData.experience.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No work experience added yet. Click "Add Experience" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                  <Button onClick={addEducation} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {cvData.education.map((edu, index) => (
                  <div key={edu.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Education {index + 1}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="University Name"
                        />
                      </div>
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="Bachelor's, Master's, PhD"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Field of Study</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                          placeholder="Computer Science, Engineering"
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={edu.duration}
                          onChange={(e) => updateEducation(edu.id, 'duration', e.target.value)}
                          placeholder="2018 - 2022"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>GPA (Optional)</Label>
                      <Input
                        value={edu.gpa || ""}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        placeholder="3.8/4.0"
                      />
                    </div>
                  </div>
                ))}
                
                {cvData.education.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No education added yet. Click "Add Education" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Technical Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      placeholder="Add a technical skill (e.g., React, Python, AWS)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addSkill('technicalSkills', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Press Enter to add skill
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {cvData.technicalSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeSkill('technicalSkills', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                  
                  {cvData.technicalSkills.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No technical skills added yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Soft Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      placeholder="Add a soft skill (e.g., Leadership, Communication)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addSkill('softSkills', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Press Enter to add skill
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {cvData.softSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeSkill('softSkills', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                  
                  {cvData.softSkills.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No soft skills added yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Projects
                  </CardTitle>
                  <Button onClick={addProject} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {cvData.projects.map((project, index) => (
                  <div key={project.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Project {index + 1}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeProject(project.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Project Name</Label>
                        <Input
                          value={project.name}
                          onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                          placeholder="Project Name"
                        />
                      </div>
                      <div>
                        <Label>Link (Optional)</Label>
                        <Input
                          value={project.link || ""}
                          onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                        placeholder="Describe what the project does, your role, and key achievements..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div>
                      <Label>Technologies Used</Label>
                      <Input
                        value={project.technologies.join(', ')}
                        onChange={(e) => updateProject(project.id, 'technologies', e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech))}
                        placeholder="React, Node.js, MongoDB, AWS"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separate technologies with commas
                      </p>
                    </div>
                  </div>
                ))}
                
                {cvData.projects.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No projects added yet. Click "Add Project" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extras" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certifications
                    </CardTitle>
                    <Button onClick={addCertification} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.certifications.map((cert, index) => (
                    <div key={cert.id} className="p-3 border rounded space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Certification {index + 1}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCertification(cert.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          value={cert.name}
                          onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                          placeholder="Certification Name"
                        />
                        <Input
                          value={cert.issuer}
                          onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                          placeholder="Issuing Organization"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={cert.date}
                            onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                            placeholder="Date Obtained"
                          />
                          <Input
                            value={cert.link || ""}
                            onChange={(e) => updateCertification(cert.id, 'link', e.target.value)}
                            placeholder="Credential URL"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {cvData.certifications.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No certifications added
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      Languages
                    </CardTitle>
                    <Button onClick={addLanguage} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.languages.map((lang, index) => (
                    <div key={lang.id} className="p-3 border rounded space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Language {index + 1}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLanguage(lang.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={lang.language}
                          onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                          placeholder="Language"
                        />
                        <select
                          value={lang.proficiency}
                          onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Level</option>
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Basic">Basic</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  {cvData.languages.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No languages added
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  );
}
