"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { parseLeadRow, ParsedLeadRow } from "@/lib/leadImport";
import { SOURCE_LABELS, STAGE_LABELS, PRIORITY_LABELS } from "@/lib/constants";

export default function ImportLeadsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedLeadRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    totalRows?: number;
    importedCount?: number;
    skippedCount?: number;
    failedCount?: number;
    errors?: { row: number; reason: string }[];
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadResult(null);
    setIsParsing(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        alert("The uploaded spreadsheet contains no sheets.");
        setIsParsing(false);
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { raw: false });

      if (rawJson.length === 0) {
        alert("The sheet does not have any data rows.");
        setIsParsing(false);
        return;
      }

      const mapped = rawJson.map((row, idx) => parseLeadRow(row, idx + 1));
      setParsedRows(mapped);
    } catch (err: any) {
      console.error("Error parsing spreadsheet:", err);
      alert("Failed to parse file: " + (err.message || "Unknown error"));
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const name = droppedFile.name.toLowerCase();
      if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
        processFile(droppedFile);
      } else {
        alert("Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.");
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (!file || validRows.length === 0) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("skipDuplicates", String(skipDuplicates));

      const res = await fetch("/api/leads/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import leads");
      }

      setUploadResult(data);
    } catch (err: any) {
      console.error("Import error:", err);
      setUploadResult({
        success: false,
        message: err.message || "An error occurred while importing leads.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up pb-12">
      {/* Top Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
            >
              &larr; Back to Leads
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Import Leads
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Upload an Excel (<span className="font-semibold text-stone-700">.xlsx, .xls</span>) or CSV (<span className="font-semibold text-stone-700">.csv</span>) spreadsheet to bulk-add leads.
          </p>
        </div>

        {/* Download Sample Templates */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/api/leads/template?format=xlsx"
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 hover:text-stone-900 transition-colors"
          >
            <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 9h-2v2h2v-2zm-4 0H9v2h2v-2zm-2 4h2v2H9v-2zm4 0h2v2h-2v-2zM13 9V3.5L18.5 9H13z"/>
            </svg>
            Excel Template (.xlsx)
          </a>
          <a
            href="/api/leads/template?format=csv"
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 hover:text-stone-900 transition-colors"
          >
            <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2v4h4l-4-4zm-3 8h2v1h-2v-1zm0 3h2v1h-2v-1zm4-3h2v1h-2v-1zm0 3h2v1h-2v-1z"/>
            </svg>
            CSV Template (.csv)
          </a>
        </div>
      </div>

      {/* Success Notification Banner */}
      {uploadResult && uploadResult.success && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-500 p-2 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-900">
                Import Complete!
              </h3>
              <p className="mt-0.5 text-sm text-emerald-700">
                {uploadResult.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/pipeline"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                >
                  View Pipeline &rarr;
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-50 transition-colors"
                >
                  View Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  Import Another File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {uploadResult && !uploadResult.success && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-500 p-2 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-red-900">Import Failed</h3>
              <p className="mt-0.5 text-sm text-red-700">{uploadResult.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Dropzone */}
      {!uploadResult?.success && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? "border-pink-500 bg-pink-50/50"
                : file
                ? "border-purple-300 bg-purple-50/20"
                : "border-stone-300 bg-stone-50/40 hover:border-purple-400 hover:bg-stone-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500/10 to-indigo-500/10 text-purple-600 transition-transform group-hover:scale-105">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            {file ? (
              <div>
                <p className="text-base font-semibold text-stone-900">
                  {file.name}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • Click or drop another file to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  Click to choose a file or drag and drop here
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)
                </p>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {isParsing && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-stone-500">
              <svg className="h-5 w-5 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Reading and parsing file rows...</span>
            </div>
          )}

          {/* Parsed Data Preview & Settings */}
          {parsedRows.length > 0 && !isParsing && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              {/* Summary Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-stone-100 px-3 py-1.5 text-center">
                    <span className="block text-xs text-stone-500">Total Rows</span>
                    <span className="font-bold text-stone-800">{parsedRows.length}</span>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-center">
                    <span className="block text-xs text-emerald-600">Valid Leads</span>
                    <span className="font-bold text-emerald-700">{validRows.length}</span>
                  </div>
                  {invalidRows.length > 0 && (
                    <div className="rounded-xl bg-rose-50 px-3 py-1.5 text-center">
                      <span className="block text-xs text-rose-600">Invalid Rows</span>
                      <span className="font-bold text-rose-700">{invalidRows.length}</span>
                    </div>
                  )}
                </div>

                {/* Duplicate Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Skip duplicate leads (by email or phone)</span>
                </label>
              </div>

              {/* Preview Table */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Preview Data (Showing first {Math.min(5, parsedRows.length)} of {parsedRows.length} rows)
                  </h3>
                  <span className="text-xs text-stone-400">
                    All columns mapped automatically
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
                    <thead className="bg-stone-50 font-semibold text-stone-600">
                      <tr>
                        <th className="py-2.5 px-3">Row</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Contact</th>
                        <th className="py-2.5 px-3">Source</th>
                        <th className="py-2.5 px-3">Stage</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3">Est. Value</th>
                        <th className="py-2.5 px-3">Created At</th>
                        <th className="py-2.5 px-3">Follow Up</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-stone-400">{row.rawRowIndex || i + 1}</td>
                          <td className="py-2.5 px-3 font-medium text-stone-900">
                            {row.name || <span className="italic text-rose-500">Missing Name</span>}
                          </td>
                          <td className="py-2.5 px-3 text-stone-500">
                            <div>{row.phone || "—"}</div>
                            {row.email && <div className="text-[11px] text-stone-400">{row.email}</div>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                              {SOURCE_LABELS[row.source] || row.source}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                              {STAGE_LABELS[row.stage] || row.stage}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                              row.priority === "HIGH"
                                ? "bg-rose-50 text-rose-700"
                                : row.priority === "MEDIUM"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-stone-100 text-stone-600"
                            }`}>
                              {PRIORITY_LABELS[row.priority] || row.priority}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-stone-700">
                            {row.estimatedValue !== null ? `₹${row.estimatedValue.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-stone-500">
                            {row.createdAt.toISOString().slice(0, 10)}
                          </td>
                          <td className="py-2.5 px-3 text-stone-500">
                            {row.nextFollowUp ? row.nextFollowUp.toISOString().slice(0, 10) : "—"}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600" title={row.validationError}>
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Invalid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isUploading}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel & Change File
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isUploading || validRows.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-purple-600/25 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-purple-600/35 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isUploading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Importing Leads...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      <span>Import {validRows.length} Valid Leads</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
