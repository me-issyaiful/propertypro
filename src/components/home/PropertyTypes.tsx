import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Building2, Building, MapPin, Warehouse } from 'lucide-react';
import { categoryService } from '../../services/categoryService';

interface PropertyTypeItemProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  link: string;
}

const PropertyTypeItem: React.FC<PropertyTypeItemProps> = ({ icon, title, count, link }) => {
  return (
    <Link to={link} className="card flex items-center p-4 hover:border-primary group">
      <div className="bg-primary/10 p-3 rounded-full mr-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-heading font-semibold text-accent group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-neutral-500">
          {count} properti
        </p>
      </div>
    </Link>
  );
};

const PropertyTypes: React.FC = () => {
  const [categories, setCategories] = useState<{id: string, name: string, slug: string, icon: string, propertyCount: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAllCategories({ isActive: true });
      
      // Map to simplified structure and sort by property count
      const mappedCategories = data
        .map(category => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon || 'Home',
          propertyCount: category.propertyCount || 0
        }))
        .sort((a, b) => b.propertyCount - a.propertyCount);
      
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      Home,
      Building2,
      Building,
      Store: Building,
      Warehouse,
      MapPin,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Home;
    return <IconComponent size={24} />;
  };

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-2">
              Jelajahi Berdasarkan Tipe Properti
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Temukan properti yang sesuai dengan kebutuhan Anda dari berbagai pilihan tipe properti
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null; // Don't show section if no categories
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-2">
            Jelajahi Berdasarkan Tipe Properti
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Temukan properti yang sesuai dengan kebutuhan Anda dari berbagai pilihan tipe properti
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <PropertyTypeItem 
              key={category.id}
              icon={getIconComponent(category.icon)} 
              title={category.name} 
              count={category.propertyCount} 
              link={`/jual?type=${category.slug}`} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyTypes;