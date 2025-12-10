"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw, RotateCw, Settings2, Download } from "lucide-react"

interface BottomToolbarProps {
  onDownloadPDF: () => void
}

export const BottomToolbar = ({ onDownloadPDF }: BottomToolbarProps) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
      <div className="bg-card border border-border rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg">
        <Button size="sm" variant="ghost" className="p-2">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="p-2">
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="p-2">
          <Settings2 className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="p-2" onClick={onDownloadPDF}>
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}