import Image from "next/image";

export default function BrandLogo({ className = "", eager = false }: { className?: string; eager?: boolean }) {
  return <Image src="/LOGOMOMAYAZ.png" alt="مميز · Momayaz" width={216} height={72}
    className={"momayaz-logo " + className} loading={eager ? "eager" : "lazy"} />;
}
