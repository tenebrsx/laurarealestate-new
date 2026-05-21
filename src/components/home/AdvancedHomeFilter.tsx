'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import './AdvancedHomeFilter.css';

export default function AdvancedHomeFilter() {
    const router = useRouter();
    const [filters, setFilters] = useState({
        province: '',
        city_sector: '',
        property_type: '',
        operation_type: 'sale',
        min_price: '',
        max_price: ''
    });

    const provinceSectors: Record<string, string[]> = {
        'Santo Domingo': [
            'Autopista de San Isidro',
            'El Higüero',
            'Hato Nuevo',
            'La Victoria',
            'Los Alcarrizos',
            'Pedro Brand',
            'Santo Domingo Norte',
            'Villa Mella'
        ],
        'Distrito Nacional': [
            'Altos de Arroyo Hondo II',
            'Arroyo Hondo',
            'Bella Vista',
            'Cuesta Hermosa II',
            'Cuesta Hermosa III',
            'El Millón',
            'El Vergel',
            'Ensanche Kennedy',
            'Ensanche La Fe',
            'Ensanche Naco',
            'Ensanche Paraiso',
            'Ensanche Serrallés',
            'Evaristo Morales',
            'Gazcue',
            'Isabel Villa',
            'Julieta Morales',
            'La Esperilla',
            'Los Pinos',
            'Los Prados',
            'Los próceres',
            'Mirador Sur',
            'Piantini',
            'Viejo Arroyo Hondo',
            'Zona Colonial',
            'Zona Industrial de Herrera'
        ],
        'La Altagracia (Punta Cana / Bávaro)': [
            'Cap Cana',
            'Uvero Alto'
        ],
        'Santiago': [
            'La Trinitaria',
            'Villa Olga',
            'Los Cerros de Gurabo'
        ],
        'Samaná': [
            'Cosón',
            'El Limon',
            'Playa Pescadores',
            'Santa Bárbara de Samaná',
            'balcones del atlántico'
        ],
        'Puerto Plata': [
            'Cabarete'
        ],
        'La Romana (Casa de Campo)': [
            'Casa de Campo'
        ],
        'Otras Ubicaciones': [
            'Bonao',
            'Buena Vista (Jarabacoa)',
            'Mata de Platano (Jarabacoa)',
            'Guayacanes (Juan Dolio)',
            'Palmar de Ocoa',
            'San Cristóbal'
        ]
    };

    const salePrices = [
        { value: '5000', label: 'USD 5,000' },
        { value: '10000', label: 'USD 10,000' },
        { value: '20000', label: 'USD 20,000' },
        { value: '30000', label: 'USD 30,000' },
        { value: '50000', label: 'USD 50,000' },
        { value: '75000', label: 'USD 75,000' },
        { value: '100000', label: 'USD 100,000' },
        { value: '150000', label: 'USD 150,000' },
        { value: '200000', label: 'USD 200,000' },
        { value: '250000', label: 'USD 250,000' },
        { value: '300000', label: 'USD 300,000' },
        { value: '350000', label: 'USD 350,000' },
        { value: '400000', label: 'USD 400,000' },
        { value: '450000', label: 'USD 450,000' },
        { value: '500000', label: 'USD 500,000' },
        { value: '600000', label: 'USD 600,000' },
        { value: '700000', label: 'USD 700,000' },
        { value: '800000', label: 'USD 800,000' },
        { value: '900000', label: 'USD 900,000' },
        { value: '1000000', label: 'USD 1,000,000' },
        { value: '1500000', label: 'USD 1,500,000' },
        { value: '2000000', label: 'USD 2,000,000' }
    ];

    const rentalPrices = [
        { value: '500', label: 'USD 500' },
        { value: '800', label: 'USD 800' },
        { value: '1000', label: 'USD 1,000' },
        { value: '1200', label: 'USD 1,200' },
        { value: '1500', label: 'USD 1,500' },
        { value: '1800', label: 'USD 1,800' },
        { value: '2000', label: 'USD 2,000' },
        { value: '2500', label: 'USD 2,500' },
        { value: '3000', label: 'USD 3,000' },
        { value: '3500', label: 'USD 3,500' },
        { value: '4000', label: 'USD 4,000' },
        { value: '4500', label: 'USD 4,500' },
        { value: '5000', label: 'USD 5,000' },
        { value: '6000', label: 'USD 6,000' },
        { value: '7000', label: 'USD 7,000' },
        { value: '8000', label: 'USD 8,000' },
        { value: '10000', label: 'USD 10,000' },
        { value: '15000', label: 'USD 15,000' }
    ];

    const currentPrices = filters.operation_type === 'rental' ? rentalPrices : salePrices;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'operation_type') {
            // When switching operation type, reset prices to prevent invalid bounds
            setFilters(prev => ({
                ...prev,
                operation_type: value,
                min_price: '',
                max_price: ''
            }));
        } else if (name === 'province') {
            // When switching province, reset sector to prevent mismatched sector pairings
            setFilters(prev => ({
                ...prev,
                province: value,
                city_sector: ''
            }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        const queryParams = new URLSearchParams();
        
        // If a specific sector is selected, search for that (it is more specific)
        // Otherwise, search for the province
        if (filters.city_sector) {
            queryParams.append('location', filters.city_sector);
        } else if (filters.province) {
            queryParams.append('location', filters.province);
        }
        
        if (filters.property_type) queryParams.append('property_type', filters.property_type);
        if (filters.operation_type) queryParams.append('operation_type', filters.operation_type);
        if (filters.min_price) queryParams.append('min_price', filters.min_price);
        if (filters.max_price) queryParams.append('max_price', filters.max_price);

        const queryString = queryParams.toString();
        router.push(`/properties${queryString ? `?${queryString}` : ''}`);
    };

    const provinces = Object.keys(provinceSectors);

    const propertyTypes = ['Apartamento', 'Casa', 'Penthouse', 'Terreno', 'Local Comercial'];

    const renderSectorOptions = () => {
        if (filters.province) {
            const sectors = provinceSectors[filters.province] || [];
            return (
                <>
                    <option value="">Todas</option>
                    {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                    ))}
                </>
            );
        }

        // Grouped list of all sectors
        return (
            <>
                <option value="">Todas</option>
                {Object.entries(provinceSectors).map(([provName, sectors]) => (
                    <optgroup key={provName} label={provName}>
                        {sectors.map(sector => (
                            <option key={`${provName}-${sector}`} value={sector}>{sector}</option>
                        ))}
                    </optgroup>
                ))}
            </>
        );
    };

    return (
        <section className="advanced-filter-section animate-fade-in">
            <div className="advanced-filter-panel glass-panel">
                <form className="advanced-filter-form" onSubmit={handleSearch}>
                    
                    <div className="filter-group">
                        <label htmlFor="operation_type">Operación</label>
                        <select 
                            id="operation_type" 
                            name="operation_type" 
                            className="filter-select"
                            value={filters.operation_type}
                            onChange={handleChange}
                            suppressHydrationWarning
                        >
                            <option value="sale">Comprar</option>
                            <option value="rental">Alquilar</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="property_type">Tipo de Propiedad</label>
                        <select 
                            id="property_type" 
                            name="property_type" 
                            className="filter-select"
                            value={filters.property_type}
                            onChange={handleChange}
                            suppressHydrationWarning
                        >
                            <option value="">Todas</option>
                            {propertyTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="province">Provincia / Región</label>
                        <select 
                            id="province" 
                            name="province" 
                            className="filter-select"
                            value={filters.province}
                            onChange={handleChange}
                            suppressHydrationWarning
                        >
                            <option value="">Todas</option>
                            {provinces.map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="city_sector">Ciudad / Sector</label>
                        <select 
                            id="city_sector" 
                            name="city_sector" 
                            className="filter-select"
                            value={filters.city_sector}
                            onChange={handleChange}
                            suppressHydrationWarning
                        >
                            {renderSectorOptions()}
                        </select>
                    </div>

                    <div className="filter-group price-group">
                        <label>Rango de Precio (USD)</label>
                        <div className="price-inputs">
                            <select 
                                name="min_price" 
                                className="filter-select min-select"
                                value={filters.min_price}
                                onChange={handleChange}
                                suppressHydrationWarning
                            >
                                <option value="">Min</option>
                                {currentPrices.map(price => (
                                    <option key={`min-${price.value}`} value={price.value}>{price.label}</option>
                                ))}
                            </select>
                            <span className="price-separator">-</span>
                            <select 
                                name="max_price" 
                                className="filter-select max-select"
                                value={filters.max_price}
                                onChange={handleChange}
                                suppressHydrationWarning
                            >
                                <option value="">Max</option>
                                {currentPrices.map(price => (
                                    <option key={`max-${price.value}`} value={price.value}>{price.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filter-submit-group">
                         <button type="submit" className="btn-advanced-search">
                            <span>Buscar</span> <Search size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
