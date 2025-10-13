import React from 'react';
import { Shield, Truck, RefreshCw, Phone } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'Price Match Guarantee',
    description: 'We\'ll match any competitor\'s price'
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $99'
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy'
  },
  {
    icon: Phone,
    title: 'Expert Support',
    description: '1800-HARDWARE'
  }
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-brown-500">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brown-900 text-brown-100 rounded-full mb-4">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-brown-900 mb-2">
                  {badge.title}
                </h3>
                <p className="text-brown-900">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}