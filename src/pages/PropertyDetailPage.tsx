import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PropertyMap from '../components/common/PropertyMap';
import { Property } from '../types';
import { 
  MapPin, 
  Calendar, 
  Heart, 
  Share2, 
  Printer, 
  Bed, 
  Bath, 
  Move,
  Home,
  Phone,
  Mail,
  CheckCircle,
  Car,
  Droplets,
  Trees,
  Tv,
  Utensils,
  Briefcase,
  Sun,
  Shield,
  LayoutGrid
} from 'lucide-react';
import { formatPrice } from '../utils/formatter';
import { Helmet } from 'react-helmet-async';
import { listingService } from '../services/listingService';
import { useToast } from '../contexts/ToastContext';
import { getFeatureLabelById } from '../types/listing';

// Feature icon mapping
const featureIcons: Record<string, React.ElementType> = {
  // Parking
  garage: Car,
  carport: Car,
  street_parking: Car,
  
  // Outdoor spaces
  garden: Trees,
  patio: Trees,
  balcony: Trees,
  swimming_pool: Droplets,
  
  // Security
  cctv: Shield,
  gated_community: Shield,
  security_system: Shield,
  
  // Interior amenities
  air_conditioning: Sun,
  built_in_wardrobes: Home,
  storage: Home,
  
  // Kitchen features
  modern_appliances: Utensils,
  kitchen_island: Utensils,
  pantry: Utensils,
  
  // Additional rooms
  study: Briefcase,
  home_office: Briefcase,
  entertainment_room: Tv,
  
  // Layout options
  open_floor_plan: LayoutGrid,
  separate_dining: LayoutGrid,
  master_bedroom_downstairs: Bed,
  modern_kitchen: Utensils,
  
  // Utilities
  solar_panels: Sun,
  water_tank: Droplets,
  backup_generator: Home
};

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showError } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isContactFormVisible, setIsContactFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  
  useEffect(() => {
    if (id) {
      fetchPropertyDetails(id);
    }
    
    // Scroll to top when navigating to a property detail
    window.scrollTo(0, 0);
  }, [id]);
  
  const fetchPropertyDetails = async (propertyId: string) => {
    setIsLoading(true);
    try {
      // Fetch property details
      const propertyData = await listingService.getListingById(propertyId);
      
      if (!propertyData) {
        throw new Error('Property not found');
      }
      
      setProperty(propertyData);
      setActiveImage(propertyData.images[0]);
      
      // Increment view count
      await listingService.incrementViewCount(propertyId);
      
      // Fetch similar properties
      const { data: similarData } = await listingService.getAllListings({
        type: propertyData.type,
        purpose: propertyData.purpose,
        status: 'active'
      }, 1, 3);
      
      // Filter out the current property
      const filteredSimilar = similarData.filter(p => p.id !== propertyId);
      setSimilarProperties(filteredSimilar);
      
    } catch (error) {
      console.error('Error fetching property details:', error);
      showError('Error', 'Failed to load property details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="font-heading text-2xl font-bold mb-4">Properti Tidak Ditemukan</h2>
            <p className="mb-6">Maaf, properti yang Anda cari tidak ditemukan atau telah dihapus.</p>
            <Link to="/" className="btn-primary">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Group features by category
  const groupedFeatures: Record<string, string[]> = {};
  
  // Initialize with empty arrays for each category
  const categories = [
    'Parking',
    'Outdoor Spaces',
    'Security',
    'Interior Amenities',
    'Kitchen Features',
    'Additional Rooms',
    'Utilities',
    'Layout Options',
    'Other'
  ];
  
  categories.forEach(category => {
    groupedFeatures[category] = [];
  });
  
  // Categorize features
  property.features.forEach(feature => {
    let found = false;
    
    // Check if it's a predefined feature
    if (featureIcons[feature]) {
      // Determine category based on feature ID
      if (feature.includes('garage') || feature.includes('carport') || feature.includes('parking')) {
        groupedFeatures['Parking'].push(feature);
        found = true;
      } else if (feature.includes('garden') || feature.includes('patio') || feature.includes('balcony') || feature.includes('pool')) {
        groupedFeatures['Outdoor Spaces'].push(feature);
        found = true;
      } else if (feature.includes('cctv') || feature.includes('security') || feature.includes('gated')) {
        groupedFeatures['Security'].push(feature);
        found = true;
      } else if (feature.includes('air') || feature.includes('wardrobe') || feature.includes('storage')) {
        groupedFeatures['Interior Amenities'].push(feature);
        found = true;
      } else if (feature.includes('kitchen') || feature.includes('appliance') || feature.includes('pantry')) {
        groupedFeatures['Kitchen Features'].push(feature);
        found = true;
      } else if (feature.includes('study') || feature.includes('office') || feature.includes('entertainment')) {
        groupedFeatures['Additional Rooms'].push(feature);
        found = true;
      } else if (feature.includes('solar') || feature.includes('water') || feature.includes('generator')) {
        groupedFeatures['Utilities'].push(feature);
        found = true;
      } else if (feature.includes('floor') || feature.includes('dining') || feature.includes('bedroom')) {
        groupedFeatures['Layout Options'].push(feature);
        found = true;
      }
    }
    
    // If not categorized, put in Other
    if (!found) {
      groupedFeatures['Other'].push(feature);
    }
  });
  
  // Remove empty categories
  Object.keys(groupedFeatures).forEach(category => {
    if (groupedFeatures[category].length === 0) {
      delete groupedFeatures[category];
    }
  });
  
  return (
    <Layout>
      <Helmet>
        <title>{`${property.title} | Properti Pro`}</title>
        <meta name="description" content={property.description.substring(0, 160)} />
        <meta name="keywords" content={`properti, ${property.type}, ${property.location.city}, ${property.purpose === 'jual' ? 'dijual' : 'disewa'}`} />
        <link rel="canonical" href={`https://propertipro.id/properti/${property.id}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://propertipro.id/properti/${property.id}`} />
        <meta property="og:title" content={property.title} />
        <meta property="og:description" content={property.description.substring(0, 160)} />
        <meta property="og:image" content={property.images[0]} />
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex text-sm mb-4">
            <Link to="/" className="text-primary hover:underline">Beranda</Link>
            <span className="mx-2 text-neutral-400">/</span>
            <Link 
              to={`/${property.purpose}`} 
              className="text-primary hover:underline"
            >
              {property.purpose === 'jual' ? 'Dijual' : 'Disewa'}
            </Link>
            <span className="mx-2 text-neutral-400">/</span>
            <span className="text-neutral-700 truncate">{property.title}</span>
          </nav>
          
          {/* Property Title Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase mb-2 ${property.purpose === 'jual' ? 'bg-primary text-white' : 'bg-success-500 text-white'}`}>
                  {property.purpose === 'jual' ? 'Dijual' : 'Disewa'}
                </span>
                <h1 className="font-heading font-bold text-2xl md:text-3xl text-accent">
                  {property.title}
                </h1>
                <div className="flex items-center mt-2 text-neutral-600">
                  <MapPin size={16} className="mr-1" />
                  <span>
                    {property.location.address}, {property.location.district}, {property.location.city}, {property.location.province}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary">
                  {formatPrice(property.price, property.priceUnit)}
                  {property.purpose === 'sewa' && <span className="text-sm font-normal text-neutral-500">/bulan</span>}
                </h2>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-200">
              <div className="flex items-center text-neutral-600">
                <Calendar size={16} className="mr-1" />
                <span className="text-sm">
                  Dipasang: {new Date(property.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex gap-2 ml-auto">
                <button className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors" aria-label="Simpan properti">
                  <Heart size={18} />
                </button>
                <button className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors" aria-label="Bagikan properti">
                  <Share2 size={18} />
                </button>
                <button className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors" aria-label="Cetak properti">
                  <Printer size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="h-[400px]">
                  <img 
                    src={activeImage} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {property.images.map((img, index) => (
                    <div 
                      key={index}
                      className={`w-24 h-24 flex-shrink-0 cursor-pointer border-2 rounded overflow-hidden ${activeImage === img ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img 
                        src={img} 
                        alt={`${property.title} - Gambar ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Property Details */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="font-heading font-semibold text-xl mb-4">Detail Properti</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg">
                    <Bed size={24} className="text-primary mb-2" />
                    <span className="text-sm text-neutral-500">Kamar Tidur</span>
                    <span className="font-semibold">{property.bedrooms || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg">
                    <Bath size={24} className="text-primary mb-2" />
                    <span className="text-sm text-neutral-500">Kamar Mandi</span>
                    <span className="font-semibold">{property.bathrooms || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg">
                    <Move size={24} className="text-primary mb-2" />
                    <span className="text-sm text-neutral-500">Luas Bangunan</span>
                    <span className="font-semibold">{property.buildingSize ? `${property.buildingSize} m²` : '-'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg">
                    <Home size={24} className="text-primary mb-2" />
                    <span className="text-sm text-neutral-500">Luas Tanah</span>
                    <span className="font-semibold">{property.landSize ? `${property.landSize} m²` : '-'}</span>
                  </div>
                  
                  {property.floors && (
                    <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg">
                      <Home size={24} className="text-primary mb-2" />
                      <span className="text-sm text-neutral-500">Jumlah Lantai</span>
                      <span className="font-semibold">{property.floors}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-lg mb-2">Deskripsi</h3>
                  <p className="text-neutral-700 whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
                
                {/* Features by Category */}
                {Object.keys(groupedFeatures).length > 0 && (
                  <div>
                    <h3 className="font-heading font-semibold text-lg mb-3">Fasilitas & Fitur</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(groupedFeatures).map(([category, features]) => (
                        features.length > 0 && (
                          <div key={category} className="border rounded-lg p-3">
                            <h4 className="font-medium text-neutral-800 mb-2">{category}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {features.map((feature, index) => {
                                const Icon = featureIcons[feature] || CheckCircle;
                                return (
                                  <div key={index} className="flex items-center">
                                    <Icon size={16} className="text-primary mr-2" />
                                    <span>{getFeatureLabelById(feature) || feature}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Location Map */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="font-heading font-semibold text-xl mb-4">Lokasi</h2>
                
                {/* Property Map Component */}
                <PropertyMap
                  propertyId={property.id}
                  propertyTitle={property.title}
                  location={{
                    latitude: property.location.latitude,
                    longitude: property.location.longitude,
                    address: property.location.address,
                    district: property.location.district,
                    city: property.location.city,
                    province: property.location.province
                  }}
                  searchRadius={2}
                />
              </div>
            </div>
            
            {/* Right Column */}
            <div>
              {/* Agent Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    <img 
                      src={property.agent.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'} 
                      alt={property.agent.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">{property.agent.name}</h3>
                    <p className="text-sm text-neutral-500">{property.agent.company}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <a 
                    href={`tel:${property.agent.phone}`} 
                    className="flex items-center justify-center gap-2 bg-primary text-white font-medium py-2 px-4 rounded-lg w-full hover:bg-primary/90 transition-colors"
                  >
                    <Phone size={18} />
                    <span>{property.agent.phone}</span>
                  </a>
                  <a 
                    href={`mailto:${property.agent.email}`} 
                    className="flex items-center justify-center gap-2 bg-white text-primary border border-primary font-medium py-2 px-4 rounded-lg w-full hover:bg-primary/5 transition-colors"
                  >
                    <Mail size={18} />
                    <span>Email</span>
                  </a>
                </div>
                
                <button 
                  className="w-full text-center text-primary hover:underline"
                  onClick={() => setIsContactFormVisible(!isContactFormVisible)}
                >
                  {isContactFormVisible ? 'Tutup Form' : 'Kirim Pesan'}
                </button>
                
                {isContactFormVisible && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <form>
                      <div className="mb-3">
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                          Nama
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Nama lengkap Anda"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Email Anda"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                          Telepon
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Nomor telepon Anda"
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">
                          Pesan
                        </label>
                        <textarea
                          id="message"
                          rows={4}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Saya tertarik dengan properti ini. Mohon informasi lebih lanjut."
                          defaultValue="Saya tertarik dengan properti ini. Mohon informasi lebih lanjut."
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full btn-primary"
                      >
                        Kirim Pesan
                      </button>
                    </form>
                  </div>
                )}
              </div>
              
              {/* Similar Properties */}
              {similarProperties.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-heading font-semibold text-lg mb-4">Properti Serupa</h3>
                  
                  <div className="space-y-4">
                    {similarProperties.map(similarProperty => (
                      <Link 
                        key={similarProperty.id} 
                        to={`/properti/${similarProperty.id}`}
                        className="flex gap-3 group"
                      >
                        <div className="w-24 h-20 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={similarProperty.images[0]} 
                            alt={similarProperty.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                            {similarProperty.title}
                          </h4>
                          <p className="text-primary font-semibold text-sm">
                            {formatPrice(similarProperty.price, similarProperty.priceUnit)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetailPage;