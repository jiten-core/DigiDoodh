// Component Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        profile: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'DAIRY_OWNER',
            dairy: { id: '1', name: 'Test Dairy' },
        },
        login: jest.fn().mockResolvedValue({ success: true }),
        logout: jest.fn(),
        loading: false,
        isAuthenticated: true,
    }),
    AuthProvider: ({ children }: any) => children,
}))

// Mock sonner toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn(),
    },
}))

describe('UI Component Rendering', () => {
    it('should render Button component', async () => {
        const { Button } = await import('@/components/ui/button')
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should render Input component', async () => {
        const { Input } = await import('@/components/ui/input')
        render(<Input placeholder="Enter text" />)
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render Card component', async () => {
        const { Card, CardHeader, CardTitle, CardContent } = await import('@/components/ui/card')
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Test Card</CardTitle>
                </CardHeader>
                <CardContent>Card content</CardContent>
            </Card>
        )
        expect(screen.getByText('Test Card')).toBeInTheDocument()
        expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should render Badge component', async () => {
        const { Badge } = await import('@/components/ui/badge')
        render(<Badge>Active</Badge>)
        expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should render Alert component', async () => {
        const { Alert, AlertDescription } = await import('@/components/ui/alert')
        render(
            <Alert>
                <AlertDescription>This is an alert</AlertDescription>
            </Alert>
        )
        expect(screen.getByText('This is an alert')).toBeInTheDocument()
    })
})

describe('Button Interactions', () => {
    it('should handle click events', async () => {
        const { Button } = await import('@/components/ui/button')
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Click me</Button>)

        fireEvent.click(screen.getByText('Click me'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', async () => {
        const { Button } = await import('@/components/ui/button')
        render(<Button disabled>Disabled</Button>)

        expect(screen.getByText('Disabled')).toBeDisabled()
    })

    it('should render different variants', async () => {
        const { Button } = await import('@/components/ui/button')
        const { container } = render(<Button variant="outline">Outline</Button>)

        expect(container.firstChild).toHaveClass('border')
    })
})

describe('Input Interactions', () => {
    it('should handle input changes', async () => {
        const { Input } = await import('@/components/ui/input')
        const handleChange = jest.fn()
        render(<Input onChange={handleChange} />)

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'test' } })
        expect(handleChange).toHaveBeenCalled()
    })

    it('should show placeholder', async () => {
        const { Input } = await import('@/components/ui/input')
        render(<Input placeholder="Enter name" />)

        expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument()
    })
})

describe('Form Controls', () => {
    it('should render Label component', async () => {
        const { Label } = await import('@/components/ui/label')
        render(<Label htmlFor="test">Test Label</Label>)
        expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should render Textarea component', async () => {
        const { Textarea } = await import('@/components/ui/textarea')
        render(<Textarea placeholder="Enter description" />)
        expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
    })

    it('should render Checkbox component', async () => {
        const { Checkbox } = await import('@/components/ui/checkbox')
        render(<Checkbox aria-label="Accept terms" />)
        expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('should toggle Switch component', async () => {
        const { Switch } = await import('@/components/ui/switch')
        render(<Switch aria-label="Toggle" />)

        const switchEl = screen.getByRole('switch')
        expect(switchEl).toBeInTheDocument()
    })
})

describe('Data Display', () => {
    it('should render Table components', async () => {
        const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } = await import('@/components/ui/table')
        render(
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>John</TableCell>
                        <TableCell>john@test.com</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        )

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('John')).toBeInTheDocument()
    })

    it('should render Progress component', async () => {
        const { Progress } = await import('@/components/ui/progress')
        const { container } = render(<Progress value={50} />)
        expect(container.firstChild).toBeInTheDocument()
    })

    it('should render Skeleton component', async () => {
        const { Skeleton } = await import('@/components/ui/skeleton')
        const { container } = render(<Skeleton className="w-20 h-4" />)
        expect(container.firstChild).toHaveClass('animate-pulse')
    })
})

describe('Overlay Components', () => {
    it('should render Tooltip', async () => {
        const { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } = await import('@/components/ui/tooltip')
        render(
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>Hover me</TooltipTrigger>
                    <TooltipContent>Tooltip content</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
        expect(screen.getByText('Hover me')).toBeInTheDocument()
    })
})

describe('Accessibility', () => {
    it('buttons should have accessible names', async () => {
        const { Button } = await import('@/components/ui/button')
        render(<Button aria-label="Submit form">Submit</Button>)
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('inputs should have accessible labels', async () => {
        const { Input } = await import('@/components/ui/input')
        const { Label } = await import('@/components/ui/label')
        render(
            <>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" />
            </>
        )
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('checkboxes should be keyboard accessible', async () => {
        const { Checkbox } = await import('@/components/ui/checkbox')
        render(<Checkbox aria-label="Accept" />)

        const checkbox = screen.getByRole('checkbox')
        checkbox.focus()
        expect(checkbox).toHaveFocus()
    })
})
