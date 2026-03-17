import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, MapPin, Trophy, Dumbbell, Globe, Star, ExternalLink } from "lucide-react";
import { ReactNode } from "react";

// In a real app, we'd define a proper interface for the Education object.
// For now, I'll allow any structure that matches our data.
interface EducationDialogProps {
    education: any;
    children: ReactNode;
}

export function EducationDialog({ education, children }: EducationDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                            <img src={education.institutionLogo} alt={education.institution} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <DialogTitle className="text-2xl">{education.institution}</DialogTitle>
                                {education.institutionUrl && (
                                    <a
                                        href={education.institutionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-accent transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                            <p className="text-accent font-medium">{education.degree}</p>
                        </div>
                    </div>
                    <DialogDescription className="text-base flex items-center gap-2">
                        {education.period} • {education.location}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-6 pt-2 space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-2">About</h4>
                            <p className="text-muted-foreground leading-relaxed">{education.description}</p>
                        </div>

                        {education.skills && education.skills.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Dumbbell className="w-4 h-4" /> Skills Acquired
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {education.skills.map((skill: string) => (
                                        <Badge key={skill} variant="outline" className="text-sm py-1">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {education.associatedProjects && education.associatedProjects.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Associated Projects
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-1">
                                    {education.associatedProjects.map((project: string) => (
                                        <li key={project}>{project}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {education.associatedAwards && education.associatedAwards.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Trophy className="w-4 h-4" /> Awards & Honors
                                </h4>
                                <ul className="grid sm:grid-cols-2 gap-3">
                                    {education.associatedAwards.map((award: string) => (
                                        <li key={award} className="bg-secondary/30 p-3 rounded-lg text-sm text-foreground flex items-center gap-2 border border-border/50">
                                            <Star className="w-3 h-3 text-accent" /> {award}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {education.courses && education.courses.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" /> Coursework
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {education.courses.map((course: string) => (
                                        <span key={course} className="text-xs border border-border px-2 py-1 rounded bg-secondary/10">
                                            {course}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
