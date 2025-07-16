import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, CheckCircle, AlertCircle } from "lucide-react";

interface CSVImportProps {
  onClose?: () => void;
}

export function CSVImport({ onClose }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      return await apiRequest("/api/clients/import-csv", {
        method: "POST",
        body: JSON.stringify({ csvData: data }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.imported} clients.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: "Failed to import CSV data. Please check the format.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Invalid CSV",
          description: "CSV file must have at least a header row and one data row.",
          variant: "destructive",
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvData(data);
      setPreview(data.slice(0, 5)); // Show first 5 rows for preview
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (csvData.length > 0) {
      importMutation.mutate(csvData);
    }
  };

  const downloadTemplate = () => {
    const template = "Fiscal Name,Tax ID,Email,Country,City,Postcode,Address\n" +
                    "Example School Ltd,12345678,contact@example.edu,Spain,Madrid,28001,\"123 Main Street, Madrid\"\n" +
                    "Another Institute SA,87654321,info@another.edu,France,Paris,75001,\"456 Avenue des Champs-Élysées, Paris\"";
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Clients from CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <h3 className="font-medium text-blue-900">Need a template?</h3>
            <p className="text-sm text-blue-700">Download our CSV template with the correct format and example data.</p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select CSV File</label>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-slate-500">
            Required columns: Fiscal Name, Tax ID, Email, Country, City, Postcode, Address
          </p>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Preview (first 5 rows)</h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 text-left">Fiscal Name</th>
                    <th className="p-2 text-left">Tax ID</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Country</th>
                    <th className="p-2 text-left">City</th>
                    <th className="p-2 text-left">Postcode</th>
                    <th className="p-2 text-left">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{row["Fiscal Name"] || row.fiscalName}</td>
                      <td className="p-2">{row["Tax ID"] || row.taxId}</td>
                      <td className="p-2">{row["Email"] || row.email}</td>
                      <td className="p-2">{row["Country"] || row.country}</td>
                      <td className="p-2">{row["City"] || row.city}</td>
                      <td className="p-2">{row["Postcode"] || row.postcode}</td>
                      <td className="p-2">{row["Address"] || row.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-600">
              {csvData.length} total rows found in file
            </p>
          </div>
        )}

        {/* Import Button */}
        {csvData.length > 0 && !importResult && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">
              Ready to import {csvData.length} clients
            </span>
            <Button 
              onClick={handleImport} 
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? "Importing..." : "Import Clients"}
            </Button>
          </div>
        )}

        {/* Import Progress */}
        {importMutation.isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importing clients...</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully imported {importResult.imported} clients.
                {importResult.errors > 0 && ` ${importResult.errors} rows had errors.`}
              </AlertDescription>
            </Alert>

            {importResult.errorDetails && importResult.errorDetails.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700">Errors:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {importResult.errorDetails.map((error: any, index: number) => (
                    <div key={index} className="text-sm text-red-600 p-2 bg-red-50 rounded">
                      Row {error.row}: {error.error || error.errors?.map((e: any) => e.message).join(', ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}