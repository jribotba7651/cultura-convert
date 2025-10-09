import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SecurityProvider } from "./components/SecurityProvider";
import { ShoppingCart } from "./components/store/ShoppingCart";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Store from "./pages/Store";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Auth from "./pages/Auth";
import Services from "./pages/Services";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/AdminOrders";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";
import TestComponent from "./components/TestComponent";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <>
      <ShoppingCart />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/store" element={<Store />} />
        <Route path="/store/product/:id" element={<ProductDetails />} />
        <Route path="/services" element={<Services />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/mis-pedidos" element={<MyOrders />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/test" element={<TestComponent />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  console.log('App component rendering...');
  
  try {
    return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <SecurityProvider>
            <CartProvider>
              <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
                </TooltipProvider>
              </QueryClientProvider>
            </CartProvider>
          </SecurityProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
    );
  } catch (error) {
    console.error('CRITICAL ERROR in App component:', error);
    throw error;
  }
};

export default App;
