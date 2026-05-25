type PageCoverBannerProps = {
  title: string;
  coverUrl?: string;
};

export function PageCoverBanner({ title, coverUrl }: PageCoverBannerProps) {
  if (!coverUrl) {
    return (
      <div className="border-border bg-muted grid h-40 place-items-center rounded-md border border-dashed">
        <p className="text-muted-foreground text-sm">No cover image</p>
      </div>
    );
  }

  return (
    <div className="bg-muted relative h-48 overflow-hidden rounded-md">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${JSON.stringify(coverUrl)})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 p-5">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
      </div>
    </div>
  );
}
