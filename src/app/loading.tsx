export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/30 py-3">
        <div className="h-[72px] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Loading tools...</span>
          </div>
        </div>
      </div>
      
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-16">
          <div className="mb-10">
            <div className="h-16 w-64 mx-auto bg-muted rounded animate-pulse" />
            <div className="h-1 w-48 mx-auto my-4 bg-muted rounded animate-pulse" />
            <div className="h-8 w-80 mx-auto bg-muted rounded animate-pulse" />
          </div>
          
          <div className="h-6 w-96 mx-auto mb-10 bg-muted rounded animate-pulse" />
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="h-12 w-full bg-muted rounded-lg animate-pulse" />
          </div>
          
          <div className="flex gap-4 justify-center">
            <div className="h-12 w-40 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
        
        <section className="mb-16">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
