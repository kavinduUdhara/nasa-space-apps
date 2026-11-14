"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Settings2,
  ShieldCheck,
  FileCode2,
  Sparkles,
} from "lucide-react";
import { BIGQUERY_SETUP_DDL } from "@/lib/earth-datasets";

interface BigQuerySetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: (details: { projectId: string; datasetId: string }) => void;
}

export function BigQuerySetupDialog({
  open,
  onOpenChange,
  onConnected,
}: BigQuerySetupDialogProps) {
  const [projectId, setProjectId] = useState<string>("nasa-space-apps-archive");
  const [datasetId, setDatasetId] = useState<string>("earth_observation_archive");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copiedDdl, setCopiedDdl] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/bigquery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-connection",
          projectId: projectId.trim(),
          datasetId: datasetId.trim(),
          clientEmail: clientEmail.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || "Connection validated successfully!",
        });
        if (onConnected) {
          onConnected({
            projectId: projectId.trim(),
            datasetId: datasetId.trim(),
          });
        }
      } else {
        setTestResult({
          success: false,
          message: data.message || "Failed to validate BigQuery parameters.",
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "Network error testing BigQuery connection.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyDdl = () => {
    navigator.clipboard.writeText(BIGQUERY_SETUP_DDL);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  const envSnippet = `# Google Cloud BigQuery Archive Configuration
BIGQUERY_PROJECT_ID="${projectId || "your-gcp-project-id"}"
BIGQUERY_DATASET_ID="${datasetId || "earth_observation_archive"}"
# Option A: Service account email & private key
BIGQUERY_CLIENT_EMAIL="bigquery-agent@${projectId || "your-gcp-project-id"}.iam.gserviceaccount.com"
BIGQUERY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."
# Option B: Or path to downloaded service account JSON file
GOOGLE_APPLICATION_CREDENTIALS="./gcp-key.json"`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-slate-950 text-slate-100 border-white/15 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Configure Google BigQuery Archive
                  <Badge variant="outline" className="border-cyan-400/40 text-cyan-300 text-[10px]">
                    NASA Earthdata
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Connect your Google Cloud BigQuery project to stream historical records from Giovanni, Hydrology, AppEEARS, CDO, and SeaWiFS.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="connection" className="mt-4">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="connection" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-200">
              <Settings2 className="mr-1.5 h-3.5 w-3.5" />
              Connection & Test
            </TabsTrigger>
            <TabsTrigger value="guide" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-200">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Setup Guide (Step-by-Step)
            </TabsTrigger>
            <TabsTrigger value="schema" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-200">
              <FileCode2 className="mr-1.5 h-3.5 w-3.5" />
              BigQuery SQL DDL
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Connection & Test */}
          <TabsContent value="connection" className="space-y-4 pt-3">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 text-xs text-cyan-200/90 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Enter your Google Cloud project details below. When configured, queries are executed server-side against BigQuery tables. The app gracefully falls back to the high-precision calibrated NASA archive if BigQuery credentials are in setup mode.
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bq-project" className="text-xs font-medium text-slate-300">
                  Google Cloud Project ID
                </Label>
                <Input
                  id="bq-project"
                  placeholder="e.g. nasa-space-apps-2024"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="border-white/15 bg-white/5 text-white placeholder:text-slate-500 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Found in your Google Cloud Console dashboard header.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bq-dataset" className="text-xs font-medium text-slate-300">
                  BigQuery Dataset Name
                </Label>
                <Input
                  id="bq-dataset"
                  placeholder="earth_observation_archive"
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                  className="border-white/15 bg-white/5 text-white placeholder:text-slate-500 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Default: <code className="text-cyan-300">earth_observation_archive</code>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bq-email" className="text-xs font-medium text-slate-300">
                Service Account Email (Optional for testing)
              </Label>
              <Input
                id="bq-email"
                placeholder="bigquery-reader@your-project.iam.gserviceaccount.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="border-white/15 bg-white/5 text-white placeholder:text-slate-500 text-xs font-mono"
              />
              <p className="text-[10px] text-slate-400">
                Requires the <strong>BigQuery Data Viewer</strong> and <strong>BigQuery Job User</strong> IAM roles.
              </p>
            </div>

            {testResult && (
              <div
                className={`rounded-xl border p-3 text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-200"
                    : "border-rose-500/30 bg-rose-950/30 text-rose-200"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">
                    {testResult.success ? "Connection Verified" : "Verification Notice"}
                  </p>
                  <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="border-white/15 text-xs text-slate-300 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                size="sm"
                className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-medium text-xs gap-1.5"
                onClick={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Validate & Save Connection
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: Setup Guide */}
          <TabsContent value="guide" className="space-y-4 pt-3 text-xs text-slate-300">
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 text-[11px]">
                    1
                  </span>
                  Enable BigQuery in Google Cloud Console
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Go to{" "}
                  <a
                    href="https://console.cloud.google.com/bigquery"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-300 underline inline-flex items-center gap-1"
                  >
                    Google Cloud Console <ExternalLink className="h-3 w-3" />
                  </a>
                  , select or create your project, and ensure the <strong>BigQuery API</strong> is enabled.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 text-[11px]">
                    2
                  </span>
                  Create Dataset & Run Schema DDL
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  In BigQuery Studio, open the Query Editor and paste the DDL script from the{" "}
                  <strong className="text-cyan-300">BigQuery SQL DDL</strong> tab. It automatically partitions and clusters the tables for optimal performance.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 text-[11px]">
                      3
                    </span>
                    Add Environment Variables to .env.local
                  </h4>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-7 text-[11px] gap-1 text-slate-300 hover:text-white"
                    onClick={copyEnv}
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy .env snippet
                      </>
                    )}
                  </Button>
                </div>
                <pre className="rounded-lg bg-black/50 p-2.5 font-mono text-[11px] text-cyan-300/90 overflow-x-auto border border-white/10">
                  {envSnippet}
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: BigQuery DDL Script */}
          <TabsContent value="schema" className="space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                DDL script for partitioning & clustering the 5 historical tables:
              </span>
              <Button
                variant="outline"
                size="xs"
                className="gap-1.5 border-white/15 text-xs text-slate-200 hover:text-white"
                onClick={copyDdl}
              >
                {copiedDdl ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    DDL Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy All DDL SQL
                  </>
                )}
              </Button>
            </div>

            <pre className="h-64 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/90 p-4 font-mono text-[11px] text-slate-200 leading-relaxed">
              {BIGQUERY_SETUP_DDL}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
