
import { TemplateProps } from '@/types/resume';
import { Phone, Mail, MapPin, Linkedin, Github } from 'lucide-react';
import { Section } from './shared/Section';

export const ExecutiveTemplate = ({ data }: TemplateProps) => {
  return (
    <div className="min-h-[287mm] p-8 font-sans text-gray-800 bg-white shadow-sm">
      {/* Header with accent bar */}
      <div className="border-l-4 border-blue-600 pl-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          {data.personalInfo.fullName}
        </h1>

        {/* Contact Info - Compact and organized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>{data.personalInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="truncate">{data.personalInfo.email}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{data.personalInfo.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-600" />
              <span className="truncate">{data.personalInfo.linkedin}</span>
            </div>
            {data.personalInfo.github && (
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-blue-600" />
                <span className="truncate">{data.personalInfo.github}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Education */}
        <Section title="Education">
          {data.education.map((edu, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {edu.institution}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {edu.degree}{edu.minor && `, ${edu.minor}`}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600 whitespace-nowrap ml-4">
                  <div>{edu.startDate} – {edu.endDate}</div>
                  <div className="text-xs">{edu.location}</div>
                </div>
              </div>
              {edu.gpa && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">GPA:</span> {edu.gpa}
                </p>
              )}
            </div>
            ))}
        </Section>

        {/* Experience */}
        <Section title="Experience">
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-5 last:mb-0">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {exp.position}
                  </h3>
                  <p className="text-sm text-gray-700 font-medium">
                    {exp.company}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600 whitespace-nowrap ml-4">
                  <div>{exp.startDate} – {exp.endDate}</div>
                  <div className="text-xs">{exp.location}</div>
                </div>
              </div>
              <ul className="list-none space-y-1.5 mt-2">
                {exp.description.map((desc, descIndex) => (
                  <li key={descIndex} className="text-sm text-gray-700 flex">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        {/* Projects */}
        <Section title="Projects">
          {data.projects.map((proj, index) => (
            <div key={index} className="mb-5 last:mb-0">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {proj.name}
                  </h3>
                  {proj.technologies && (
                    <p className="text-sm text-gray-700 font-medium">
                      Tech: {proj.technologies}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-600 whitespace-nowrap ml-4">
                  <div>{proj.startDate} – {proj.endDate}</div>
                </div>
              </div>
              <ul className="list-none space-y-1.5 mt-2">
                {proj.description.map((desc, descIndex) => (
                  <li key={descIndex} className="text-sm text-gray-700 flex">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        {/* Skills */}
        <Section title="Technical Skills">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {data.skills.languages.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Languages</h4>
                <p className="text-gray-700">{data.skills.languages.join(", ")}</p>
              </div>
            )}

            {data.skills.frameworks.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Frameworks</h4>
                <p className="text-gray-700">{data.skills.frameworks.join(", ")}</p>
              </div>
            )}

            {data.skills.tools.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Developer Tools</h4>
                <p className="text-gray-700">{data.skills.tools.join(", ")}</p>
              </div>
            )}

            {data.skills.libraries.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Libraries</h4>
                <p className="text-gray-700">{data.skills.libraries.join(", ")}</p>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};
