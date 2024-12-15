'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { updateSavedItem } from '@/lib/storage';

interface Tool {
  name: string;
  description?: string;
  price: string;
  features: string[];
  validityPeriod: string;
  topFeedback: string[];
  customerSupport: string;
  website: string; // Add website to the interface
}

interface ToolsData {
  categories: {
    [key: string]: Tool[];
  }
}

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItemId: string;
  url: string; // Add this prop
}

export function RecommendationsModal({ isOpen, onClose, savedItemId, url }: RecommendationsModalProps) {
  const { toast } = useToast();
  const [toolsByCategory, setToolsByCategory] = useState<{ [key: string]: Tool[] }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTools, setSelectedTools] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        const data: ToolsData = await response.json();
        setToolsByCategory(data.categories);
        setCategories(Object.keys(data.categories));
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchTools();
    }
  }, [isOpen]);

  if (!isOpen || loading || categories.length === 0) return null;

  const handleToolSelect = (category: string, toolName: string) => {
    setSelectedTools(prev => ({
      ...prev,
      [category]: toolName
    }));
  };

  const handleExportSummary = () => {
    // Implement PDF export or saving functionality
    const summary = Object.entries(selectedTools)
      .map(([category, tool]) => `${category}: ${tool}`)
      .join('\n');
    
    // For now, just console.log the summary
    console.log('Selected tools:', summary);
    // TODO: Implement actual export/save functionality
  };

  const handleSaveSelections = async () => {
    try {
      // Get all selected tools
      const toolSelections = Object.entries(selectedTools)
        .filter(([_, toolName]) => toolName) // Filter out empty selections
        .map(([category, toolName]) => ({
          category,
          toolName
        }));

      if (toolSelections.length === 0) {
        throw new Error('Please select at least one tool');
      }

      // Update the saved item with the selections
      updateSavedItem(savedItemId, {
        selectedTools: toolSelections
      });

      toast({
        title: "Success",
        description: "Your tool selections have been saved",
      });

      onClose();
    } catch (error) {
      console.error('Error saving selections:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save selections. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderToolsPage = (category: string) => {
    const tools = toolsByCategory[category] || [];
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          Suggested {category.replace(/([A-Z])/g, ' $1').trim()}
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.name} className="border rounded-lg p-6 relative h-full flex flex-col">
              <div className="absolute right-3 top-3">
                <Checkbox
                  checked={selectedTools[category] === tool.name}
                  onCheckedChange={() => handleToolSelect(category, tool.name)}
                />
              </div>

              <h3 className="text-xl font-semibold mb-3">{tool.name}</h3>
              
              <div className="space-y-2 mb-4 text-base">
                <div>
                  <span className="font-medium">Price: </span>
                  <span>{tool.price}</span>
                </div>
                <div>
                  <span className="font-medium">Validity: </span>
                  <span>{tool.validityPeriod}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-medium text-base mb-2">Key Features:</p>
                <ul className="list-disc pl-6 space-y-1">
                  {tool.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-sm">{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <p className="font-medium text-base mb-2">User Feedback:</p>
                <ul className="space-y-1">
                  {tool.topFeedback.map((feedback, index) => (
                    <li key={index} className="text-sm italic text-muted-foreground">
                      "{feedback}"
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <p className="font-medium text-base mb-1">Support:</p>
                <p className="text-sm text-muted-foreground">{tool.customerSupport}</p>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open(tool.website, '_blank')}
                className="w-full mt-auto text-lg"
              >
                Learn More
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSummaryPage = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Your Selections</h2>
      
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category} className="border rounded-lg p-4">
            <h3 className="font-semibold">
              {category.replace(/([A-Z])/g, ' $1').trim()}:
            </h3>
            <p className="text-lg">
              {selectedTools[category] || 'No selection made'}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleSaveSelections} // You'll need to implement this function
          className="bg-green-600 hover:bg-green-700"
        >
          Save Selections
        </Button>
      </div>
    </div>
  );

  const isLastPage = currentPage === categories.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={cn(
        "bg-background rounded-lg p-6 mx-auto relative overflow-y-auto",
        isLastPage 
          ? "w-[500px] max-h-[600px]" 
          : "w-[85vw] h-[81vh]"
      )}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className={cn("mt-6", isLastPage && "px-4")}>
          {isLastPage ? renderSummaryPage() : renderToolsPage(categories[currentPage])}
        </div>

        <div className="flex justify-between mt-12 pb-4">
          <Button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 0}
            variant="outline"
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {currentPage + 1} / {categories.length + 1}
            </span>
          </div>
          <Button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={isLastPage}
          >
            {isLastPage ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
