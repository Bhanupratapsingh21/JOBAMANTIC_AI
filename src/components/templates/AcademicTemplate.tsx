import { TemplateProps } from "@/types/resume";
import { BookOpen, Code2, Briefcase, GraduationCap } from "lucide-react";

export const AcademicTemplate = ({ data }: TemplateProps) => {
  return (
    <div className=" min-h-[277mm] bg-white text-gray-800 font-inter p-10 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          {data.personalInfo.fullName}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{data.personalInfo.headline}</p>

        <div className="text-xs mt-3 flex justify-center flex-wrap gap-2 text-gray-500">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.location}</span>
        </div>

        <div className="text-xs mt-1 flex justify-center flex-wrap gap-2 text-blue-600 font-medium">
          {data.personalInfo.linkedin && (
            <span>LinkedIn: {data.personalInfo.linkedin}</span>
          )}
          {data.personalInfo.github && (
            <span>GitHub: {data.personalInfo.github}</span>
          )}
          {data.personalInfo.website && (
            <span>Portfolio: {data.personalInfo.website}</span>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Education */}
        <Section
          title="Education"
          icon={<GraduationCap className="w-4 h-4 text-indigo-500" />}
        >
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {edu.institution}
                  </h3>
                  <p className="text-sm">{edu.degree}</p>
                  {edu.minor && (
                    <p className="text-sm text-gray-600">Minor: {edu.minor}</p>
                  )}
                  {edu.gpa && (
                    <p className="text-xs text-gray-600">GPA: {edu.gpa}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-600">{edu.location}</p>
            </div>
          ))}
        </Section>

        {/* Research / Experience */}
        <Section
          title="Research & Experience"
          icon={<BookOpen className="w-4 h-4 text-indigo-500" />}
        >
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-5">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{exp.position}</h3>
                <span className="text-xs text-gray-500">
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              <p className="text-sm italic text-gray-600 mb-1">
                {exp.company}, {exp.location}
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        {/* Projects */}
        <Section
          title="Projects"
          icon={<Briefcase className="w-4 h-4 text-indigo-500" />}
        >
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-5">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{proj.name}</h3>
                <span className="text-xs text-gray-500">
                  {proj.startDate} – {proj.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-600 italic mb-1">
                Tech: {proj.technologies}
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {proj.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        {/* Skills */}
        <Section
          title="Technical Skills"
          icon={<Code2 className="w-4 h-4 text-indigo-500" />}
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800">Languages</h4>
              <p className="text-gray-600">
                {data.skills.languages.join(", ")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Frameworks</h4>
              <p className="text-gray-600">
                {data.skills.frameworks.join(", ")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Libraries</h4>
              <p className="text-gray-600">
                {data.skills.libraries.join(", ")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Tools</h4>
              <p className="text-gray-600">{data.skills.tools.join(", ")}</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

// Shared section component
const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center gap-2 border-b border-gray-200 pb-1 mb-3">
      {icon}
      <h2 className="text-lg font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
    </div>
    {children}
  </div>
);
