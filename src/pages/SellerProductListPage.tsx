// src/pages/SellerProductListPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useSellerProductsWithAdmin } from '../hooks/useSupabase'; // Use new seller hook with admin products
import { Product } from '../types';
import { CreditCard as Edit, Trash2, PlusCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext'; // To get current user's ID

export function SellerProductListPage() {
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { loading, error, fetchAllProductsWithAdmin, deleteProduct, isOwnProduct, isAdminProduct } = useSellerProductsWithAdmin(userId);
  const [products, setProducts] = useState<Product[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const getProducts = async () => {
      if (!userId) return; // Don't fetch if no user ID
      const data = await fetchAllProductsWithAdmin();
      if (data) {
        const mappedProducts: Product[] = data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description || '',
          price: p.price,
          originalPrice: p.original_price || undefined,
          images: p.images || [],
          category: (p.categories as any)?.name || 'N/A',
          department: (p.departments as any)?.name || 'N/A',
          brand: p.brand || '',
          rating: p.rating || 0,
          reviewCount: p.review_count || 0,
          stock: p.stock || 0,
          specifications: p.specifications || {},
          category_id: p.category_id || null,
          department_id: p.department_id || null,
          seller_id: p.seller_id, // Include seller_id for permission checks
        }));
        setProducts(mappedProducts);
      }
    };
    getProducts();
  }, [refresh, fetchAllProductsWithAdmin, userId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const success = await deleteProduct(id);
      if (success) {
        setRefresh(prev => !prev);
      } else {
        alert('Failed to delete product.');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {typeof error === 'string' ? error : JSON.stringify(error)}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown-900">My Products</h2>
        <Link to="/seller/products/new">
          <Button>
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-600 py-10">No products found.</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={product.images[0] || 'https://placehold.co/40'} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                      {product.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isAdminProduct(product) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isOwnProduct(product) ? (
                        <>
                          <Link to={`/seller/products/${product.id}/edit`} className="text-brown-600 hover:text-brown-900 mr-3">
                            <Edit className="w-5 h-5 inline" />
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-5 h-5 inline" />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">Read Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={product.images[0] || 'https://placehold.co/60'}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-brown-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.slug}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-brown-700 mb-4">
                  <p>
                    Price: <span className="font-medium">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-gray-500 line-through ml-2">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </p>
                  <p>
                    Stock: <span className={`font-medium ${
                      product.stock > 10 ? 'text-green-800' :
                      product.stock > 0 ? 'text-yellow-800' :
                      'text-red-800'
                    }`}>{product.stock}</span>
                  </p>
                  <p>Category: <span className="font-medium">{product.category}</span></p>
                  <p>Department: <span className="font-medium">{product.department}</span></p>
                  <p>Owner: {isAdminProduct(product) ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      You
                    </span>
                  )}</p>
                </div>
                <div className="flex justify-end space-x-2">
                  {isOwnProduct(product) ? (
                    <>
                      <Link to={`/seller/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm px-3 py-2">Read Only</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
