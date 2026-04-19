import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Heart, Search, Filter, ShoppingCart, Plus, Minus, Edit2, Share2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DEFAULT_SHOP } from '@/constants';

export default function Shop() {
  const { profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [productList, setProductList] = useState<any[]>(DEFAULT_SHOP);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity } = useCart();

  const handleShare = async (product: any) => {
    const shareData = {
      title: `Soul Himalaya Shop - ${product.name}`,
      text: `Check out this handcrafted treasure: ${product.name}`,
      url: `${window.location.origin}${window.location.pathname}?id=${product.id}`
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Sharing failed:", err);
      }
    }
  };
  const categories = ['All', 'Wall Decor', 'Home Decor', 'Accessories'];

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'shop_item'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const dbProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data().data
        })).sort((a, b) => {
          const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
          const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
          if (aOrder !== bOrder) return aOrder - bOrder;

          const aAvail = a.isAvailable !== false;
          const bAvail = b.isAvailable !== false;
          if (aAvail && !bAvail) return -1;
          if (!aAvail && bAvail) return 1;
          return 0;
        });
        setProductList(dbProducts);
      }
    });

    return () => unsubscribe();
  }, []);

  const getItemQuantity = (id: any) => {
    return globalCart.find(i => i.id === `product-${id}`)?.quantity || 0;
  };

  const filteredProducts = activeCategory === 'All' 
    ? productList 
    : productList.filter(p => p.category === activeCategory);

  return (
    <div className="pt-24">
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Macramé Shop</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Handcrafted With Love</p>
      </div>

      {/* Shop Content */}
      <section className="py-20 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  onClick={() => setActiveCategory(cat)}
                  className={activeCategory === cat ? 'bg-terracotta text-white' : 'border-forest/10 text-forest'}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/40" />
              <Input placeholder="Search products..." className="pl-10 rounded-full border-forest/10 bg-white" />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
              >
                <Card className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white h-full flex flex-col p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    {product.isAvailable === false && (
                      <div className="absolute inset-0 bg-forest/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <Badge className="bg-rose-500 text-white border-none px-6 py-2 text-sm font-bold shadow-xl">
                          Currently Unavailable
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 space-y-2 z-10">
                      <Button size="icon" variant="secondary" className="rounded-full bg-white/90 text-forest hover:bg-terracotta hover:text-white transition-colors shadow-md">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShare(product);
                        }}
                        className="flex items-center justify-center h-10 w-10 bg-white/90 p-2 rounded-full shadow-lg hover:bg-terracotta hover:text-white transition-colors group/share"
                        title="Share Product"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      {profile?.role === 'admin' && (
                        <Link 
                          to={product.id ? `/admin?tab=content&type=shop_item&edit=${product.id}` : `/admin?tab=content&type=shop_item`}
                          className="flex items-center justify-center h-10 w-10 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/edit"
                          title={product.id ? "Edit Item" : "Sync defaults to edit"}
                        >
                          <Edit2 className="h-4 w-4 text-forest group-hover/edit:text-terracotta transition-colors" />
                        </Link>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button className="bg-white text-forest hover:bg-terracotta hover:text-white rounded-full px-6 font-bold">
                        Quick View
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-forest">{product.name}</h3>
                      <div className="text-terracotta font-bold">₹{product.price}</div>
                    </div>
                    <p className="text-xs text-forest/50 mb-6 uppercase tracking-widest font-bold">{product.category}</p>
                    <div className="flex items-center gap-3">
                      {getItemQuantity(`product-${product.id}`) > 0 && product.isAvailable !== false && (
                        <>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-10 w-10 rounded-full border-forest/10"
                            onClick={() => globalUpdateQuantity(`product-${product.id}`, getItemQuantity(`product-${product.id}`) - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold text-forest text-lg">{getItemQuantity(`product-${product.id}`)}</span>
                        </>
                      )}
                      <Button 
                        onClick={() => globalAddToCart({
                          id: `product-${product.id}`,
                          name: product.name,
                          price: `₹${product.price}`,
                          type: 'Product',
                          image: product.image
                        })}
                        disabled={product.isAvailable === false}
                        className={cn(
                          "flex-grow rounded-full flex items-center justify-center gap-2 transition-all duration-300",
                          product.isAvailable === false 
                            ? "bg-forest/10 text-forest/30 cursor-not-allowed" 
                            : "bg-forest hover:bg-forest/90 text-white"
                        )}
                      >
                        <ShoppingCart className="h-4 w-4" /> {product.isAvailable === false ? 'Unavailable' : (getItemQuantity(`product-${product.id}`) > 0 ? 'Add More' : 'Add to Cart')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-24 bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80"
                alt="Craftsmanship"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-terracotta p-8 rounded-3xl shadow-xl hidden md:block">
              <div className="text-4xl font-heading font-bold mb-1">100%</div>
              <div className="text-xs uppercase tracking-widest font-bold">Handmade in Tosh</div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-heading font-bold mb-8">The Art of Macramé</h2>
            <p className="text-cream/70 text-lg leading-relaxed mb-8">
              Every piece in our shop is handcrafted by local artisans in Tosh village. 
              We use eco-friendly cotton cords and driftwood collected from the Parvati river. 
              Each knot tells a story of patience, tradition, and the spirit of the mountains.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-terracotta font-bold text-xl mb-2">Eco-Friendly</div>
                <p className="text-cream/50 text-sm">Natural materials sourced responsibly.</p>
              </div>
              <div>
                <div className="text-terracotta font-bold text-xl mb-2">Local Support</div>
                <p className="text-cream/50 text-sm">Empowering Himalayan women artisans.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
