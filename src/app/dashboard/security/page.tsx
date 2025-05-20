import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Lock,
  FileKey,
  ShieldCheck,
  Server,
  Eye,
  CheckCircle2,
} from "lucide-react";

const SecurityPage = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Security & Privacy</h1>
          <p className="text-muted-foreground">
            Learn how we protect your SmartPC and data
          </p>
        </div>
      </div>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          {/* Infrastructure Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Infrastructure Security
              </CardTitle>
              <CardDescription>
                Enterprise-grade security measures protecting your SmartPC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Secure Data Centers</h3>
                    <p className="text-sm text-muted-foreground">
                      Our infrastructure is hosted in ISO 27001 certified data
                      centers with 24/7 security, biometric access, and
                      environmental controls.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Network Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Multi-layered firewall protection, DDoS mitigation, and
                      intrusion detection systems ensure your SmartPC remains
                      secure.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Regular Security Audits</h3>
                    <p className="text-sm text-muted-foreground">
                      Continuous security assessments and penetration testing by
                      third-party security experts.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileKey className="h-5 w-5" />
                Data Protection
              </CardTitle>
              <CardDescription>
                How we keep your data safe and secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">End-to-End Encryption</h3>
                    <p className="text-sm text-muted-foreground">
                      AES-256 encryption for data at rest and TLS 1.3 for data
                      in transit ensures your information remains private and
                      secure.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Automated Backups</h3>
                    <p className="text-sm text-muted-foreground">
                      Regular automated backups with point-in-time recovery
                      capabilities ensure your data is never lost.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Data Isolation</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete isolation between different users' data and
                      strict access controls prevent unauthorized access.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Access Security
              </CardTitle>
              <CardDescription>
                Multi-layered authentication and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">
                    Multi-Factor Authentication (MFA)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <h4 className="font-medium">Phone Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive SMS or phone call verification codes for
                          enhanced security.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Setup Phone MFA
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <h4 className="font-medium">Email Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Get verification codes via email for additional
                          security layer.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Setup Email MFA
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Session Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Active session monitoring and automatic timeout features
                      prevent unauthorized access.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Access Logging</h3>
                    <p className="text-sm text-muted-foreground">
                      Detailed logs of all access attempts and activities for
                      security auditing.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          {/* Data Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Data Privacy
              </CardTitle>
              <CardDescription>
                How we handle and protect your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Data Ownership</h3>
                    <p className="text-sm text-muted-foreground">
                      You retain full ownership of your data. We never access
                      your personal files without explicit permission.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Privacy by Design</h3>
                    <p className="text-sm text-muted-foreground">
                      Our systems are built with privacy in mind, following GDPR
                      and other global privacy standards.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Transparent Data Practices</h3>
                    <p className="text-sm text-muted-foreground">
                      Clear policies about what data we collect and how it's
                      used, with options to export or delete your data.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance & Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Compliance & Standards
              </CardTitle>
              <CardDescription>
                Industry standards and certifications we adhere to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Security Certifications</h3>
                    <p className="text-sm text-muted-foreground">
                      ISO 27001, SOC 2 Type II, and other industry-standard
                      certifications ensure we meet the highest security
                      standards.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Privacy Compliance</h3>
                    <p className="text-sm text-muted-foreground">
                      Full compliance with GDPR, CCPA, and other privacy
                      regulations to protect your rights.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium">Regular Audits</h3>
                    <p className="text-sm text-muted-foreground">
                      Independent third-party audits verify our compliance with
                      security and privacy standards.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPage;
