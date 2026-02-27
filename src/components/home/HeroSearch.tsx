'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/properties?location=${encodeURIComponent(query.trim())}`);
        } else {
            router.push(`/properties`);
        }
    };

    return (
        <form className="search-inputs" onSubmit={handleSearch}>
            <input
                type="text"
                placeholder="Buscar por Zona (ej. Evaristo Morales, Piantini)..."
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-search">Buscar Propiedad</button>
        </form>
    );
}
