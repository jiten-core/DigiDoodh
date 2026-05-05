import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Card, CardContent } from "./card"

interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <Card className={cn("border-0 bg-transparent shadow-none", className)}>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                {icon && (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                        {icon}
                    </div>
                )}
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
                )}
                {action && (
                    <Button onClick={action.onClick} className="bg-dairy-500 hover:bg-dairy-600">
                        {action.label}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}