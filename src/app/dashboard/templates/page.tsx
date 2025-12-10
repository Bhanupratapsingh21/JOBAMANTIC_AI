"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Star,
    Users,
    Download,
    ArrowRight,
    LayoutTemplate,
    Filter,
    Sparkles,
    TrendingUp,
    Clock,
    Grid3X3,
    List
} from "lucide-react"

interface Template {
    id: string
    name: string
    description: string
    category: "professional" | "modern" | "creative" | "minimal" | "academic"
    popularity: number
    color: string
    gradient: string
    preview: string
    tags: string[]
    isNew?: boolean
    isFeatured?: boolean
    isPopular?: boolean
}

const templates: Template[] = [
    {
        id: "jake",
        name: "Jake",
        description: "Clean LaTeX-inspired design perfect for technical roles and academic positions",
        category: "professional",
        popularity: 95,
        color: "bg-blue-500",
        gradient: "from-blue-500 to-cyan-500",
        preview: "📄",
        tags: ["Technical", "Academic", "Developer"],
        isFeatured: true,
        isPopular: true
    },
    {
        id: "modern",
        name: "Modern",
        description: "Sleek contemporary design with excellent readability and modern typography",
        category: "modern",
        popularity: 88,
        color: "bg-gray-500",
        gradient: "from-gray-600 to-slate-600",
        preview: "💼",
        tags: ["Corporate", "Business", "Clean"],
        isPopular: true
    },
    {
        id: "classic",
        name: "Classic",
        description: "Traditional resume format that's widely accepted across all industries",
        category: "professional",
        popularity: 92,
        color: "bg-green-500",
        gradient: "from-emerald-500 to-teal-500",
        preview: "📝",
        tags: ["Traditional", "Formal", "Established"]
    },
    {
        id: "executive",
        name: "Executive",
        description: "Premium design for senior-level positions and leadership roles",
        category: "professional",
        popularity: 78,
        color: "bg-purple-500",
        gradient: "from-purple-500 to-violet-500",
        preview: "👔",
        tags: ["Executive", "Leadership", "Senior"],
        isNew: true
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Ultra-clean design focusing on content with maximum whitespace",
        category: "minimal",
        popularity: 85,
        color: "bg-orange-500",
        gradient: "from-orange-400 to-amber-500",
        preview: "✨",
        tags: ["Clean", "Simple", "Elegant"]
    },
    {
        id: "academic",
        name: "Academic",
        description: "Designed for researchers, professors, and academic professionals",
        category: "academic",
        popularity: 76,
        color: "bg-red-500",
        gradient: "from-rose-500 to-pink-500",
        preview: "🎓",
        tags: ["Research", "Education", "Publications"]
    },
    {
        id: "creative",
        name: "Creative",
        description: "Bold and artistic design perfect for designers and creative professionals",
        category: "creative",
        popularity: 82,
        color: "bg-pink-500",
        gradient: "from-fuchsia-500 to-purple-500",
        preview: "🎨",
        tags: ["Design", "Creative", "Portfolio"],
        isNew: true
    },
    {
        id: "startup",
        name: "Startup",
        description: "Energetic and modern design for tech startups and innovative companies",
        category: "modern",
        popularity: 79,
        color: "bg-indigo-500",
        gradient: "from-indigo-500 to-blue-500",
        preview: "🚀",
        tags: ["Tech", "Startup", "Innovation"]
    }
]

const categories = [
    { id: "all", name: "All Templates", count: templates.length, icon: LayoutTemplate },
    { id: "professional", name: "Professional", count: templates.filter(t => t.category === "professional").length, icon: Users },
    { id: "modern", name: "Modern", count: templates.filter(t => t.category === "modern").length, icon: TrendingUp },
    { id: "creative", name: "Creative", count: templates.filter(t => t.category === "creative").length, icon: Sparkles },
    { id: "minimal", name: "Minimal", count: templates.filter(t => t.category === "minimal").length, icon: Clock },
    { id: "academic", name: "Academic", count: templates.filter(t => t.category === "academic").length, icon: Download }
]

export default function TemplatesPage() {
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    const filteredTemplates = templates.filter(template => {
        const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesCategory && matchesSearch
    })

    const handleTemplateSelect = (templateId: string) => {
        router.replace(`/resume/create?template=${templateId}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10">
            <div className="p-8">
                {/* Header Section */}
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                                <LayoutTemplate className="w-4 h-4" />
                                {templates.length} Professional Templates
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                Choose Your <span className="text-blue-600">Perfect Resume</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl">
                                Select from professionally designed templates that are ATS-friendly and optimized for your industry.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                            <div className="relative w-full sm:w-80">
                               
                                <Input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-4 py-3 border-2 border-gray-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-0 rounded-2xl"
                                />
                            </div>

                            {/* View Toggle */}
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className={`rounded-xl ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className={`rounded-xl ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Category Filters - Top Aligned */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Filter by category:</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {categories.map((category) => {
                                const Icon = category.icon
                                return (
                                    <Button
                                        key={category.id}
                                        variant={selectedCategory === category.id ? "default" : "outline"}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`rounded-2xl px-4 py-2 h-auto ${selectedCategory === category.id
                                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-blue-500"
                                            : "bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {category.name}
                                        <Badge
                                            variant="secondary"
                                            className={`ml-2 ${selectedCategory === category.id
                                                ? "bg-white/20 text-white border-white/30"
                                                : "bg-gray-100 text-gray-600 border-gray-200"
                                                }`}
                                        >
                                            {category.count}
                                        </Badge>
                                    </Button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
                                <div className="text-sm text-gray-600">Total Templates</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{templates.filter(t => t.isNew).length}</div>
                                <div className="text-sm text-gray-600">New Templates</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">95%</div>
                                <div className="text-sm text-gray-600">Most Popular</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">100%</div>
                                <div className="text-sm text-gray-600">ATS Friendly</div>
                            </div>
                        </div>
                    </div>

                    
                    {/* Templates Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedCategory === "all" ? "All Templates" :
                                    categories.find(c => c.id === selectedCategory)?.name}
                                <span className="text-gray-400 ml-2">({filteredTemplates.length})</span>
                            </h2>
                        </div>

                        <div className={`grid gap-6 ${viewMode === "grid"
                            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                            : "grid-cols-1"
                            }`}>
                            {filteredTemplates.map((template) => (
                                <Card
                                    key={template.id}
                                    className={`group cursor-pointer bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${viewMode === "list" ? "flex items-start" : ""
                                        }`}
                                    onClick={() => handleTemplateSelect(template.id)}
                                >
                                    {viewMode === "list" ? (
                                        <>
                                            <div className="flex items-center gap-4 p-6 flex-1">
                                                <div className={`w-16 h-16 bg-gradient-to-r ${template.gradient} rounded-2xl flex items-center justify-center text-white text-xl shadow-md`}>
                                                    {template.preview}
                                                </div>
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl mb-2 flex items-center gap-3">
                                                        {template.name}
                                                        <div className="flex gap-1">
                                                            {template.isNew && (
                                                                <Badge variant="default" className="bg-green-500 text-white border-0 text-xs">
                                                                    New
                                                                </Badge>
                                                            )}
                                                            {template.isPopular && (
                                                                <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                                    Popular
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </CardTitle>
                                                    <CardDescription className="text-base mb-3">
                                                        {template.description}
                                                    </CardDescription>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {template.tags.map((tag) => (
                                                            <Badge key={tag} variant="outline" className="text-xs bg-white/50">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <CardFooter className="p-6 border-l border-gray-100">
                                                <Button
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleTemplateSelect(template.id)
                                                    }}
                                                >
                                                    Use Template
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </CardFooter>
                                        </>
                                    ) : (
                                        <>
                                            <CardHeader className="pb-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className={`w-12 h-12 bg-gradient-to-r ${template.gradient} rounded-xl flex items-center justify-center text-white text-lg shadow-md`}>
                                                        {template.preview}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {template.isNew && (
                                                            <Badge variant="default" className="bg-green-500 text-white border-0 text-xs">
                                                                New
                                                            </Badge>
                                                        )}
                                                        {template.isPopular && (
                                                            <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                                Popular
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                                                <CardDescription className="text-sm leading-relaxed">
                                                    {template.description}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="pb-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {template.tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs bg-white/50">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>

                                            <CardFooter className="pt-4 border-t border-gray-100">
                                                <Button
                                                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleTemplateSelect(template.id)
                                                    }}
                                                >
                                                    Use Template
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </CardFooter>
                                        </>
                                    )}
                                </Card>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredTemplates.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <LayoutTemplate className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3">No templates found</h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    Try adjusting your search criteria or browse all templates.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSelectedCategory("all")
                                    }}
                                    className="rounded-xl"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                    {/* Featured Templates */}
                    {selectedCategory === "all" && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                <h2 className="text-2xl font-bold text-gray-900">Featured Templates</h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {templates.filter(t => t.isFeatured || t.isPopular).slice(0, 2).map((template) => (
                                    <Card
                                        key={template.id}
                                        className="group cursor-pointer border-2 border-transparent bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm hover:border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                        onClick={() => handleTemplateSelect(template.id)}
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-16 h-16 bg-gradient-to-r ${template.gradient} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                                                        {template.preview}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-2xl flex items-center gap-3 mb-2">
                                                            {template.name}
                                                            {template.isFeatured && (
                                                                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                                    Featured
                                                                </Badge>
                                                            )}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span>{template.popularity}% recommended by professionals</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardDescription className="text-lg leading-relaxed mt-4">
                                                {template.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardFooter>
                                            <Button
                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleTemplateSelect(template.id)
                                                }}
                                            >
                                                Use This Template
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Bottom CTA */}
                    <div className="mt-16 text-center">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Ready to create your resume?
                            </h2>
                            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                All templates are fully customizable and ATS-friendly. Start with any template and make it yours.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    onClick={() => handleTemplateSelect("modern")}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg rounded-xl"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Start with Modern Template
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => router.push('/resume/create')}
                                    className="rounded-xl border-2"
                                >
                                    Start from Scratch
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}