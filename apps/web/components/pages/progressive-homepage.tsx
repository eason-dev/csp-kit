'use client';

import { useState, useEffect } from 'react';
import { type ServiceRegistry } from '@csp-kit/generator';
import {
  Shield,
  AlertTriangle,
  X,
  Info,
  Settings,
  Zap,
  Users,
  TrendingUp,
  Layers,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SimpleSearch } from '@/components/search/simple-search';
import { ColorCodedHeader } from '@/components/csp/color-coded-header';
import { UsageMethods } from '@/components/csp/usage-methods';
import { useSelectedServices } from '@/contexts/selected-services-context';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface ProgressiveHomepageProps {
  serviceRegistry: ServiceRegistry;
}

// Common use-case scenarios for better UX
const SCENARIO_CARDS = [
  {
    id: 'blog-analytics',
    title: 'Blog with Analytics',
    description: 'Personal blog with Google Analytics tracking',
    icon: TrendingUp,
    color:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    services: ['google-analytics', 'google-fonts'],
  },
  {
    id: 'ecommerce-store',
    title: 'E-commerce Store',
    description: 'Online store with payments and tracking',
    icon: Shield,
    color:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    services: ['stripe', 'google-analytics', 'google-tag-manager', 'facebook-pixel'],
  },
  {
    id: 'marketing-landing',
    title: 'Marketing Landing Page',
    description: 'High-converting page with social tracking',
    icon: Users,
    color:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    services: ['facebook-pixel', 'google-analytics', 'hotjar', 'linkedin-insights'],
  },
  {
    id: 'saas-dashboard',
    title: 'SaaS Dashboard',
    description: 'Web app with user analytics and CDN',
    icon: Layers,
    color:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    services: ['mixpanel', 'amplitude', 'google-fonts'],
  },
];

export default function ProgressiveHomepage({ serviceRegistry }: ProgressiveHomepageProps) {
  const services = serviceRegistry.services;
  const { selectedServices, addService, removeService, clearServices, isSelected } =
    useSelectedServices();

  // State management
  const [useNonce, setUseNonce] = useState(false);
  const [reportUri, setReportUri] = useState('');
  const [customRules, setCustomRules] = useState<Record<string, string>>({
    'script-src': '',
    'style-src': '',
    'img-src': '',
    'connect-src': '',
    'font-src': '',
    'frame-src': '',
    'media-src': '',
    'object-src': '',
  });

  const [customRuleToggles, setCustomRuleToggles] = useState<Record<string, boolean>>({
    'script-src': false,
    'style-src': false,
    'img-src': false,
    'connect-src': false,
    'font-src': false,
    'frame-src': false,
    'media-src': false,
    'object-src': false,
  });
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    header: string;
    warnings: string[];
    includedServices: string[];
    unknownServices: string[];
    nonce?: string;
    directives: Record<string, string[]>;
  } | null>(null);

  // Check if we have any selected services
  const hasSelectedServices = selectedServices.length > 0;

  // Generate CSP automatically when services change
  useEffect(() => {
    if (hasSelectedServices) {
      generateCurrentCSP();
    } else {
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServices, useNonce, reportUri, customRules]);

  const generateCurrentCSP = async () => {
    try {
      // Build custom rules object, filtering out empty values
      const customRulesObj: Record<string, string[]> = {};
      Object.entries(customRules).forEach(([directive, value]) => {
        if (value.trim() && customRuleToggles[directive]) {
          customRulesObj[directive] = value
            .split(',')
            .map(v => v.trim())
            .filter(Boolean);
        }
      });

      // Build service array with versions
      const servicesWithVersions = selectedServices.map(service => service.id);

      const response = await fetch('/api/generate-csp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services: servicesWithVersions,
          nonce: useNonce,
          customRules: customRulesObj,
          reportUri: reportUri || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CSP');
      }

      const cspResult = await response.json();

      // Parse the CSP header to extract directives for better display
      const directives: Record<string, string[]> = {};
      if (cspResult.header) {
        const parts = cspResult.header.split(';').map((part: string) => part.trim());
        parts.forEach((part: string) => {
          const [directive, ...sources] = part.split(' ');
          if (directive && sources.length > 0) {
            directives[directive] = sources;
          }
        });
      }

      setResult({
        ...cspResult,
        directives,
      });
    } catch (error) {
      console.error('Error generating CSP:', error);
      setResult({
        header: 'Error: Failed to generate CSP',
        warnings: ['Please check your configuration'],
        includedServices: [],
        unknownServices: selectedServices.map(s => s.id),
        directives: {},
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = SCENARIO_CARDS.find(c => c.id === scenarioId);
    if (scenario) {
      // Add all services from this scenario that exist
      scenario.services.forEach(serviceId => {
        const service = services[serviceId];
        if (service && !isSelected(serviceId)) {
          addService({
            id: service.id,
            name: service.name,
          });
        }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="from-primary to-primary/70 mb-6 bg-gradient-to-r bg-clip-text text-5xl font-bold text-transparent">
          Generate CSP Headers Instantly
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl">
          Select services, get production-ready Content Security Policy headers. Protect your
          website from XSS attacks with zero configuration.
        </p>

        {/* Enhanced Search Bar */}
        <SimpleSearch services={Object.values(services)} className="mx-auto max-w-2xl" />
      </div>

      {/* Quick Start Scenarios - Hide when services are selected */}
      {selectedServices.length === 0 && (
        <Card className="mb-8">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="mb-2 flex items-center justify-center gap-2">
                <Bookmark className="text-primary h-5 w-5" />
                Quick Start Scenarios
              </CardTitle>
              <CardDescription>
                Choose a common use case to get started with the right services
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SCENARIO_CARDS.map(scenario => {
                const Icon = scenario.icon;
                const scenarioServices = scenario.services.filter(id => services[id]);

                return (
                  <div
                    key={scenario.id}
                    className={`group cursor-pointer rounded-lg border p-4 transition-all hover:shadow-lg ${scenario.color}`}
                    onClick={() => handleScenarioSelect(scenario.id)}
                  >
                    <div className="text-center">
                      <Icon className="mx-auto mb-3 h-8 w-8" />
                      <h3 className="mb-2 text-sm font-medium">{scenario.title}</h3>
                      <p className="mb-3 text-xs opacity-80">{scenario.description}</p>
                      <div className="text-xs opacity-70">
                        {scenarioServices.length} service{scenarioServices.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progressive Disclosure - Only show when services are selected */}
      {hasSelectedServices && (
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          {/* Left Column - Selected Services & Configuration */}
          <div className="space-y-6">
            {/* Selected Services */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Selected Services ({selectedServices.length})
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearServices}>
                    Clear all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedServices.map(service => (
                    <div
                      key={service.id}
                      className="bg-primary/5 hover:bg-primary/10 group flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                      onClick={() => window.open(`/service/${service.id}`, '_blank')}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-medium">{service.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-destructive/20 text-destructive h-6 w-6 p-0 transition-opacity"
                        onClick={e => {
                          e.stopPropagation();
                          removeService(service.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Configuration
                </CardTitle>
                <CardDescription>Optional settings for power users</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {/* Security Options */}
                  <AccordionItem value="security-options">
                    <AccordionTrigger className="[&_[data-badge]]:no-underline">
                      <div className="flex items-center gap-2">
                        <span>Security Options</span>
                        <div className="flex items-center gap-2">
                          {useNonce && (
                            <Badge variant="secondary" className="text-xs" data-badge>
                              Nonce
                            </Badge>
                          )}
                          {reportUri && (
                            <Badge variant="secondary" className="text-xs" data-badge>
                              Report URI
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Label>Generate Nonce</Label>
                              <InfoTooltip
                                content="A nonce (number used once) is a cryptographic token that makes inline scripts safer by allowing only scripts with the correct nonce value to execute. Essential for secure inline JavaScript and styles."
                                referenceUrl="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy#nonce"
                                referenceText="MDN: CSP Nonce"
                              />
                            </div>
                            <p className="text-muted-foreground text-xs">
                              Generate a unique nonce for inline scripts
                            </p>
                          </div>
                          <Switch checked={useNonce} onCheckedChange={setUseNonce} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="report-uri">Report URI (optional)</Label>
                            <InfoTooltip
                              content="When CSP violations occur, the browser will send a report to this URL. Essential for monitoring security issues and debugging CSP policies in production."
                              referenceUrl="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri"
                              referenceText="MDN: CSP Reporting"
                            />
                          </div>
                          <Input
                            id="report-uri"
                            type="url"
                            placeholder="https://your-site.com/csp-report"
                            value={reportUri}
                            onChange={e => setReportUri(e.target.value)}
                          />
                          <p className="text-muted-foreground text-xs">
                            CSP violations will be reported to this endpoint
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Custom CSP Rules */}
                  <AccordionItem value="custom-rules">
                    <AccordionTrigger className="[&_[data-badge]]:no-underline">
                      <div className="flex w-full flex-col items-start gap-2 pr-4">
                        <span>Custom CSP Rules</span>
                        {Object.entries(customRules).filter(
                          ([directive, value]) => value.trim() && customRuleToggles[directive]
                        ).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(customRules)
                              .filter(
                                ([directive, value]) => value.trim() && customRuleToggles[directive]
                              )
                              .map(([directive]) => (
                                <Badge
                                  key={directive}
                                  variant="secondary"
                                  className="text-xs"
                                  data-badge
                                >
                                  {directive}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                          Add custom domains and rules for each CSP directive
                        </p>
                        {Object.entries(customRules).map(([directive, value]) => {
                          // Define directive info for CSP rules
                          const directiveInfoMap = {
                            'script-src': {
                              description:
                                'Controls which scripts can be executed. Protects against XSS attacks by preventing unauthorized JavaScript execution.',
                              url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src',
                            },
                            'style-src': {
                              description:
                                'Controls which stylesheets can be loaded. Prevents CSS injection attacks and unauthorized styling.',
                              url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src',
                            },
                            'img-src': {
                              description:
                                'Controls which images can be loaded. Prevents data exfiltration through malicious images.',
                              url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src',
                            },
                            'connect-src': {
                              description:
                                'Controls which URLs can be loaded using script interfaces (fetch, XMLHttpRequest, WebSocket). Prevents unauthorized API calls.',
                              url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/connect-src',
                            },
                            'font-src': {
                              description:
                                'Controls which fonts can be loaded. Prevents unauthorized font downloads that could be used for tracking.',
                              url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src',
                            },
                            'frame-src': {
                              description:
                                'Controls which URLs can be embedded as frames. Prevents clickjacking and unauthorized iframe embedding.',
                              url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-src',
                            },
                            'media-src': {
                              description:
                                'Controls which audio and video sources can be loaded. Prevents unauthorized media content.',
                              url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/media-src',
                            },
                            'object-src': {
                              description:
                                'Controls which plugins can be loaded (Flash, Java). Generally recommended to set to "none" for security.',
                              url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/object-src',
                            },
                          };
                          const directiveInfo =
                            directiveInfoMap[directive as keyof typeof directiveInfoMap];
                          const isEnabled = customRuleToggles[directive];

                          return (
                            <div key={directive} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={directive} className="font-mono text-sm">
                                    {directive}
                                  </Label>
                                  {directiveInfo && (
                                    <InfoTooltip
                                      content={directiveInfo.description}
                                      referenceUrl={directiveInfo.url}
                                      referenceText="MDN Docs"
                                    />
                                  )}
                                </div>
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={checked => {
                                    setCustomRuleToggles(prev => ({
                                      ...prev,
                                      [directive]: checked,
                                    }));
                                    if (checked && !value) {
                                      setCustomRules(prev => ({
                                        ...prev,
                                        [directive]: 'https://example.com',
                                      }));
                                    }
                                  }}
                                />
                              </div>
                              {isEnabled && (
                                <Input
                                  id={directive}
                                  placeholder="https://example.com, 'self'"
                                  value={value}
                                  onChange={e =>
                                    setCustomRules(prev => ({
                                      ...prev,
                                      [directive]: e.target.value,
                                    }))
                                  }
                                  className="font-mono text-xs"
                                />
                              )}
                            </div>
                          );
                        })}
                        <p className="text-muted-foreground text-xs">
                          Separate multiple values with commas. Use quotes for keywords like
                          &apos;self&apos;, &apos;unsafe-inline&apos;.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - CSP Results */}
          <div className="space-y-6">
            {result && (
              <>
                {/* CSP Header with Color Coding */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Your CSP Header
                        </CardTitle>
                        <CardDescription>Ready to use in your application</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <UsageMethods
                      cspHeader={result.header}
                      serviceIds={selectedServices.map(s => s.id)}
                      useNonce={useNonce}
                      reportUri={reportUri}
                      customRules={Object.fromEntries(
                        Object.entries(customRules)
                          .filter(
                            ([directive, value]) => value.trim() && customRuleToggles[directive]
                          )
                          .map(([key, value]) => [
                            key,
                            value
                              .split(',')
                              .map(v => v.trim())
                              .filter(Boolean),
                          ])
                      )}
                    />
                  </CardContent>
                </Card>

                {/* CSP Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>CSP Breakdown</CardTitle>
                    <CardDescription>
                      Breakdown of all CSP directives and their sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ColorCodedHeader
                      header={result.header}
                      directives={result.directives}
                      onCopy={() => copyToClipboard(result.header)}
                      copied={copied}
                      showBreakdown={true}
                      serviceTags={selectedServices.map(service => ({
                        serviceId: service.id,
                        serviceName: service.name,
                      }))}
                      serviceDetails={selectedServices
                        .map(service => {
                          const serviceDefinition = services[service.id];
                          if (!serviceDefinition) return null;

                          return {
                            serviceId: service.id,
                            serviceName: service.name,
                            cspDirectives: serviceDefinition.cspDirectives,
                          };
                        })
                        .filter(
                          (
                            detail
                          ): detail is {
                            serviceId: string;
                            serviceName: string;
                            cspDirectives: Record<string, string[]>;
                          } => detail !== null
                        )}
                    />
                  </CardContent>
                </Card>

                {/* Warnings */}
                {(result.warnings?.length > 0 || result.unknownServices?.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.warnings?.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                          <span>{warning}</span>
                        </div>
                      ))}
                      {result.unknownServices?.length > 0 && (
                        <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                          <X className="mt-0.5 h-4 w-4" />
                          <span>Unknown services: {result.unknownServices.join(', ')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Call to Action when no services selected */}
      {!hasSelectedServices && (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="py-12 text-center">
            <Shield className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-lg font-medium">Ready to Generate CSP</h3>
            <p className="text-muted-foreground mb-4">
              Search for services above or choose a category to get started.
            </p>
            <div className="text-muted-foreground inline-flex items-center gap-2 text-sm">
              <Info className="h-4 w-4" />
              <span>Your CSP will update automatically as you select services</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
