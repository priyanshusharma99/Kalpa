type AvatarProps = {
  name: string;
  connectionId: number;
  highlighted?: boolean;
};

export default function Avatar({ name, connectionId, highlighted = false }: AvatarProps) {
  const avatarId = Math.abs(connectionId * 17 + 11) % 30;

  return (
    <div
      className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary-grey-100 ${highlighted ? "ring-[3px] ring-primary-green" : "ring-2 ring-primary-black"}`}
      title={name}
      aria-label={name}
    >
      <img
        src={`https://liveblocks.io/avatars/avatar-${avatarId}.png`}
        alt={name}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
