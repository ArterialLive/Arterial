import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-24 text-center">
      <p className="num text-[13px] text-fg-45">404</p>
      <h1 className="h-page mt-2">Nothing flows here</h1>
      <p className="mt-2 text-[14px] text-fg-60">That page, coin or collection does not exist.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className="btn btn-solid">
          Home
        </Link>
        <Link href="/explore" className="btn">
          Explore
        </Link>
      </div>
    </div>
  );
}
