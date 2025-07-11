import Image from "next/image";

export function SidebarLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="logo"
        width={500}
        height={400}
        priority
        className="block dark:hidden"
      />
      <Image
        src="/logo-dark.png"
        alt="logo"
        width={500}
        height={400}
        priority
        className="hidden dark:block"
      />
    </div>
  );
}
