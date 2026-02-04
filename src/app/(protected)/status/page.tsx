"use client";

import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Server,
  Activity,
  Search,
  Layers,
  FolderTree,
  Scale,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down" | "checking";
  responseTime?: number;
  lastChecked?: number;
  details?: string;
  icon: React.ReactNode;
  path?: string;
}

const ENDPOINT_ICONS: Record<string, React.ReactNode> = {
  "MCP Search": <Search className="w-5 h-5" />,
  "MCP Tools": <Layers className="w-5 h-5" />,
  "MCP Categories": <FolderTree className="w-5 h-5" />,
  "MCP Compare": <Scale className="w-5 h-5" />,
  "MCP Recommend": <Sparkles className="w-5 h-5" />,
  "MCP Templates": <Layers className="w-5 h-5" />,
};

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overallResponseTime, setOverallResponseTime] = useState<number | null>(null);

  const refreshStatuses = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      const response = await fetch("/api/status/health");
      const data = await response.json();
      
      setOverallResponseTime(data.responseTime);
      
      const results: ServiceStatus[] = data.endpoints.map((ep: { name: string; path: string; status: string }) => ({
        name: ep.name,
        status: data.status === "healthy" ? "operational" : "down",
        responseTime: data.responseTime,
        details: ep.path,
        icon: ENDPOINT_ICONS[ep.name] || <Server className="w-5 h-5" />,
        path: ep.path,
        lastChecked: data.timestamp,
      }));

      setServices(results);
    } catch {
      setServices([{
        name: "MCP API",
        status: "down",
        details: "Failed to connect to health endpoint",
        icon: <Server className="w-5 h-5" />,
        lastChecked: Date.now(),
      }]);
    }
    
    setLastRefresh(new Date());
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    refreshStatuses();
  }, [refreshStatuses]);

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadgeVariant = (status: ServiceStatus["status"]): "default" | "secondary" | "outline" => {
    switch (status) {
      case "operational":
        return "default";
      case "degraded":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "degraded":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "down":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
  };

  const overallStatus = services.every(s => s.status === "operational")
    ? "All Systems Operational"
    : services.some(s => s.status === "down")
    ? "System Outage"
    : services.some(s => s.status === "degraded")
    ? "Partial Outage"
    : "Checking...";

  const overallStatusColor = services.every(s => s.status === "operational")
    ? "text-green-500"
    : services.some(s => s.status === "down")
    ? "text-red-500"
    : services.some(s => s.status === "degraded")
    ? "text-yellow-500"
    : "text-muted-foreground";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Server className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">System Status</h1>
            <p className="text-muted-foreground text-sm">Real-time service health monitoring</p>
          </div>
        </div>
        <PixelButton
          onClick={refreshStatuses}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </PixelButton>
      </div>

      <PixelCard className="mb-8">
        <PixelCardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className={`w-10 h-10 ${overallStatusColor}`} />
              <div>
                <h2 className={`text-xl font-heading font-semibold ${overallStatusColor}`}>
                  {overallStatus}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <PixelBadge variant={services.every(s => s.status === "operational") ? "default" : "secondary"}>
              {services.filter(s => s.status === "operational").length}/{services.length} Services
            </PixelBadge>
          </div>
        </PixelCardContent>
      </PixelCard>

      <div className="space-y-4">
        {services.map((service) => (
          <PixelCard key={service.name}>
            <PixelCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={getStatusColor(service.status)}>{service.icon}</span>
                  <PixelCardTitle>{service.name}</PixelCardTitle>
                </div>
                <div className="flex items-center gap-3">
                  {service.responseTime && (
                    <span className="text-muted-foreground text-sm">
                      {service.responseTime}ms
                    </span>
                  )}
                  <PixelBadge variant={getStatusBadgeVariant(service.status)}>
                    <span className="flex items-center gap-1.5">
                      {getStatusIcon(service.status)}
                      {service.status === "checking" ? "Checking" : service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </PixelBadge>
                </div>
              </div>
            </PixelCardHeader>
            {service.details && (
              <PixelCardContent>
                <p className="text-muted-foreground text-sm">{service.details}</p>
              </PixelCardContent>
            )}
          </PixelCard>
        ))}
      </div>
    </div>
  );
}
