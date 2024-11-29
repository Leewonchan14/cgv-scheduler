'use client';

import { useDebouncedCallback } from 'use-debounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '0');
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 500);
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('search') ?? ''}
      />
      {/* <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
    </div>
  );
}
