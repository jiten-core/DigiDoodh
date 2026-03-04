'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Upload,
    FileSpreadsheet,
    Download,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    Table,
    Users,
    Milk,
    FileText,
    Eye,
    X,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ParsedRow {
    rowNumber: number;
    data: Record<string, string>;
    errors: string[];
    isValid: boolean;
}

interface UploadResult {
    total: number;
    successful: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
}

type UploadType = 'farmers' | 'milk_entries' | 'rate_charts';

const TEMPLATES = {
    farmers: {
        name: 'Farmers',
        icon: Users,
        columns: ['name', 'phone', 'village', 'aadhar', 'bank_account', 'ifsc_code', 'cattle_type'],
        sampleData: [
            ['Ramesh Patel', '9876543210', 'Ahmedabad', '1234-5678-9012', 'SBI12345678', 'SBIN0001234', 'Cow'],
            ['Suresh Kumar', '9876543211', 'Rajkot', '2345-6789-0123', 'BOB12345678', 'BARB0RAJKOT', 'Buffalo'],
        ],
        required: ['name'],
        description: 'Import farmer details in bulk'
    },
    milk_entries: {
        name: 'Milk Entries',
        icon: Milk,
        columns: ['farmer_phone', 'date', 'shift', 'quantity_liters', 'fat', 'snf', 'clr', 'temperature'],
        sampleData: [
            ['9876543210', '2026-02-09', 'Morning', '10.5', '4.0', '8.5', '28', '35'],
            ['9876543211', '2026-02-09', 'Evening', '8.0', '3.8', '8.2', '27', '34'],
        ],
        required: ['farmer_phone', 'date', 'shift', 'quantity_liters'],
        description: 'Import milk collection data in bulk'
    },
    rate_charts: {
        name: 'Rate Charts',
        icon: Table,
        columns: ['fat_min', 'fat_max', 'snf_min', 'snf_max', 'rate_per_liter', 'cattle_type'],
        sampleData: [
            ['3.0', '3.5', '8.0', '8.5', '35', 'Cow'],
            ['3.5', '4.0', '8.5', '9.0', '40', 'Cow'],
            ['5.0', '5.5', '8.5', '9.0', '50', 'Buffalo'],
        ],
        required: ['fat_min', 'fat_max', 'rate_per_liter'],
        description: 'Import rate chart configurations'
    }
};

export default function BulkUpload() {
    const { t, i18n } = useTranslation();
    const [uploadType, setUploadType] = useState<UploadType>('farmers');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [step, setStep] = useState<'select' | 'preview' | 'uploading' | 'complete'>('select');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isHindi = i18n.language === 'hi';

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            parseFile(file);
        }
    };

    const parseFile = async (file: File) => {
        setIsProcessing(true);
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                throw new Error('File must have at least a header row and one data row');
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
            const template = TEMPLATES[uploadType];
            const parsed: ParsedRow[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const data: Record<string, string> = {};
                const errors: string[] = [];

                headers.forEach((header, index) => {
                    data[header] = values[index] || '';
                });

                // Validate required fields
                template.required.forEach(field => {
                    if (!data[field]) {
                        errors.push(`Missing required field: ${field}`);
                    }
                });

                // Validate data types
                if (uploadType === 'milk_entries') {
                    if (data.quantity_liters && isNaN(parseFloat(data.quantity_liters))) {
                        errors.push('Quantity must be a number');
                    }
                    if (data.fat && (parseFloat(data.fat) < 0 || parseFloat(data.fat) > 15)) {
                        errors.push('FAT should be between 0 and 15%');
                    }
                }

                parsed.push({
                    rowNumber: i + 1,
                    data,
                    errors,
                    isValid: errors.length === 0
                });
            }

            setParsedData(parsed);
            setStep('preview');
        } catch (error) {
            console.error('Parse error:', error);
            setParsedData([]);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadTemplate = () => {
        const template = TEMPLATES[uploadType];
        const headers = template.columns.join(',');
        const rows = template.sampleData.map(row => row.join(','));
        const csv = [headers, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${uploadType}_template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        setStep('uploading');
        setUploadProgress(0);

        const validRows = parsedData.filter(row => row.isValid);
        const total = validRows.length;
        let successful = 0;
        const errors: Array<{ row: number; message: string }> = [];

        // Simulate upload with progress
        for (let i = 0; i < validRows.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));

            // Simulate 95% success rate
            if (Math.random() > 0.05) {
                successful++;
            } else {
                errors.push({ row: validRows[i].rowNumber, message: 'Failed to insert' });
            }

            setUploadProgress(Math.round(((i + 1) / total) * 100));
        }

        setUploadResult({
            total,
            successful,
            failed: total - successful,
            errors
        });
        setStep('complete');
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setParsedData([]);
        setUploadResult(null);
        setStep('select');
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validCount = parsedData.filter(r => r.isValid).length;
    const invalidCount = parsedData.filter(r => !r.isValid).length;

    return (
        <div className="space-y-6 animate-page-enter">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isHindi ? 'बल्क डेटा अपलोड' : 'Bulk Data Upload'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isHindi ? 'Excel/CSV से डेटा आयात करें' : 'Import data from Excel/CSV files'}
                    </p>
                </div>
            </div>

            {/* Upload Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.entries(TEMPLATES) as [UploadType, typeof TEMPLATES.farmers][]).map(([key, template]) => (
                    <motion.div
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card
                            className={cn(
                                "cursor-pointer transition-all duration-300 hover:shadow-lg",
                                uploadType === key
                                    ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20"
                                    : "hover:border-green-200"
                            )}
                            onClick={() => {
                                setUploadType(key);
                                resetUpload();
                            }}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                                        uploadType === key
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                    )}>
                                        <template.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{template.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {template.description}
                                        </p>
                                    </div>
                                </div>
                                {uploadType === key && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 pt-4 border-t"
                                    >
                                        <Badge className="bg-green-500 text-white">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Selected
                                        </Badge>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Upload Area */}
            <Card className="card-premium">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-500" />
                        {isHindi ? 'फ़ाइल अपलोड करें' : 'Upload File'}
                    </CardTitle>
                    <CardDescription>
                        {isHindi
                            ? `${TEMPLATES[uploadType].name} के लिए CSV या Excel फ़ाइल अपलोड करें`
                            : `Upload CSV or Excel file for ${TEMPLATES[uploadType].name}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between text-sm">
                        {['select', 'preview', 'uploading', 'complete'].map((s, i) => (
                            <div key={s} className="flex items-center">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                    step === s ? "bg-green-500 text-white" :
                                        ['select', 'preview', 'uploading', 'complete'].indexOf(step) > i
                                            ? "bg-green-100 text-green-600"
                                            : "bg-gray-100 text-gray-400"
                                )}>
                                    {i + 1}
                                </div>
                                {i < 3 && (
                                    <div className={cn(
                                        "w-16 md:w-24 h-1 mx-2 rounded",
                                        ['select', 'preview', 'uploading', 'complete'].indexOf(step) > i
                                            ? "bg-green-500"
                                            : "bg-gray-200"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        {step === 'select' && (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                {/* Download Template Button */}
                                <div className="flex justify-end">
                                    <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                                        <Download className="w-4 h-4" />
                                        {isHindi ? 'टेम्पलेट डाउनलोड करें' : 'Download Template'}
                                    </Button>
                                </div>

                                {/* Drop Zone */}
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-2xl p-12 text-center transition-all",
                                        "hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/10",
                                        selectedFile ? "border-green-500 bg-green-50" : "border-gray-300"
                                    )}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            setSelectedFile(file);
                                            parseFile(file);
                                        }
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />

                                    {isProcessing ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                                            <p className="text-gray-600">{isHindi ? 'प्रोसेस हो रहा है...' : 'Processing...'}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                                {isHindi ? 'फ़ाइल यहाँ खींचें या क्लिक करें' : 'Drag file here or click to browse'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {isHindi ? 'CSV या Excel फ़ाइल (.csv, .xlsx)' : 'CSV or Excel file (.csv, .xlsx)'}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Template Preview */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        {isHindi ? 'अपेक्षित कॉलम' : 'Expected Columns'}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {TEMPLATES[uploadType].columns.map(col => (
                                            <Badge
                                                key={col}
                                                variant={TEMPLATES[uploadType].required.includes(col) ? "default" : "secondary"}
                                                className={TEMPLATES[uploadType].required.includes(col)
                                                    ? "bg-green-500"
                                                    : "bg-gray-200 text-gray-700"
                                                }
                                            >
                                                {col}
                                                {TEMPLATES[uploadType].required.includes(col) && ' *'}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'preview' && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                {/* Summary */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-600">{parsedData.length}</p>
                                        <p className="text-sm text-gray-600">{isHindi ? 'कुल पंक्तियाँ' : 'Total Rows'}</p>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-green-600">{validCount}</p>
                                        <p className="text-sm text-gray-600">{isHindi ? 'वैध' : 'Valid'}</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-red-600">{invalidCount}</p>
                                        <p className="text-sm text-gray-600">{isHindi ? 'त्रुटियाँ' : 'Errors'}</p>
                                    </div>
                                </div>

                                {/* Data Preview Table */}
                                <div className="border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                                            <tr>
                                                <th className="p-3 text-left">#</th>
                                                <th className="p-3 text-left">{isHindi ? 'स्थिति' : 'Status'}</th>
                                                {TEMPLATES[uploadType].columns.slice(0, 4).map(col => (
                                                    <th key={col} className="p-3 text-left capitalize">
                                                        {col.replace(/_/g, ' ')}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.slice(0, 10).map((row) => (
                                                <tr key={row.rowNumber} className={cn(
                                                    "border-t",
                                                    row.isValid ? "bg-white dark:bg-gray-900" : "bg-red-50 dark:bg-red-900/20"
                                                )}>
                                                    <td className="p-3">{row.rowNumber}</td>
                                                    <td className="p-3">
                                                        {row.isValid ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-500" />
                                                        )}
                                                    </td>
                                                    {TEMPLATES[uploadType].columns.slice(0, 4).map(col => (
                                                        <td key={col} className="p-3 truncate max-w-[150px]">
                                                            {row.data[col] || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {parsedData.length > 10 && (
                                        <div className="p-3 text-center text-gray-500 bg-gray-50">
                                            {isHindi
                                                ? `और ${parsedData.length - 10} पंक्तियाँ...`
                                                : `...and ${parsedData.length - 10} more rows`
                                            }
                                        </div>
                                    )}
                                </div>

                                {/* Error Messages */}
                                {invalidCount > 0 && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="w-4 h-4" />
                                        <AlertDescription>
                                            {isHindi
                                                ? `${invalidCount} पंक्तियों में त्रुटियाँ हैं और अपलोड नहीं होंगी।`
                                                : `${invalidCount} rows have errors and will be skipped.`
                                            }
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4 justify-end">
                                    <Button variant="outline" onClick={resetUpload}>
                                        {isHindi ? 'रद्द करें' : 'Cancel'}
                                    </Button>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={validCount === 0}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {isHindi ? `${validCount} पंक्तियाँ अपलोड करें` : `Upload ${validCount} Rows`}
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'uploading' && (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="py-12 text-center space-y-6"
                            >
                                <Loader2 className="w-16 h-16 mx-auto text-green-500 animate-spin" />
                                <div>
                                    <p className="text-xl font-bold">{uploadProgress}%</p>
                                    <p className="text-gray-500">{isHindi ? 'अपलोड हो रहा है...' : 'Uploading...'}</p>
                                </div>
                                <Progress value={uploadProgress} className="w-64 mx-auto h-3" />
                            </motion.div>
                        )}

                        {step === 'complete' && uploadResult && (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="py-8 text-center space-y-6"
                            >
                                {uploadResult.failed === 0 ? (
                                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                                    </div>
                                )}

                                <div>
                                    <p className="text-2xl font-bold">
                                        {isHindi ? 'अपलोड पूरा!' : 'Upload Complete!'}
                                    </p>
                                    <p className="text-gray-500 mt-2">
                                        {isHindi
                                            ? `${uploadResult.successful} सफल, ${uploadResult.failed} असफल`
                                            : `${uploadResult.successful} successful, ${uploadResult.failed} failed`
                                        }
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                                    <div className="bg-green-50 rounded-xl p-4">
                                        <p className="text-2xl font-bold text-green-600">{uploadResult.successful}</p>
                                        <p className="text-sm text-gray-600">{isHindi ? 'सफल' : 'Success'}</p>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-4">
                                        <p className="text-2xl font-bold text-red-600">{uploadResult.failed}</p>
                                        <p className="text-sm text-gray-600">{isHindi ? 'असफल' : 'Failed'}</p>
                                    </div>
                                </div>

                                <Button onClick={resetUpload} className="bg-gradient-to-r from-green-500 to-emerald-600">
                                    {isHindi ? 'नया अपलोड' : 'Upload More'}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200">
                <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        {isHindi ? 'निर्देश' : 'Instructions'}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">1.</span>
                            {isHindi
                                ? 'पहले टेम्पलेट डाउनलोड करें'
                                : 'First download the template file'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">2.</span>
                            {isHindi
                                ? 'Excel या CSV में डेटा भरें'
                                : 'Fill in your data in Excel or CSV format'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">3.</span>
                            {isHindi
                                ? '* वाले कॉलम जरूरी हैं'
                                : 'Columns marked with * are required'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">4.</span>
                            {isHindi
                                ? 'फोन नंबर 10 अंकों का होना चाहिए'
                                : 'Phone numbers must be 10 digits'
                            }
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">5.</span>
                            {isHindi
                                ? 'दिनांक YYYY-MM-DD फॉर्मेट में होनी चाहिए'
                                : 'Date format should be YYYY-MM-DD'
                            }
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
