import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../constants';

const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'States', href: '#states' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
];

export const LandingLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">

            {/* Background Glows */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-60 left-1/2 -translate-x-1/2 h-[900px] w-[900px] rounded-full bg-blue-500/20 blur-[180px]" />
                <div className="absolute top-60 -left-48 h-[500px] w-[500px] rounded-full bg-cyan-400/20 blur-[170px]" />
                <div className="absolute top-32 -right-48 h-[600px] w-[600px] rounded-full bg-indigo-400/20 blur-[180px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[800px] w-[900px] rounded-full bg-sky-300/20 blur-[200px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-50 border-b border-white/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">ClearDrive</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    {item.name}
                                </a>
                            ))}
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link to={ROUTES.LOGIN}>
                                <Button variant="ghost" className="hover:bg-white/50">Log in</Button>
                            </Link>
                            <Link to={ROUTES.SIGNUP}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Sign up</Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-white/50 transition"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-white/30 bg-white/70 backdrop-blur-xl">
                        <div className="px-4 py-4 space-y-3">
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="block text-gray-600 hover:text-blue-600 transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </a>
                            ))}
                            <div className="pt-4 border-t border-white/30 space-y-2">
                                <Link to={ROUTES.LOGIN} onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full hover:bg-white/50">Log in</Button>
                                </Link>
                                <Link to={ROUTES.SIGNUP} onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Sign up</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="pt-16">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 text-white pt-16 pb-10 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-xl">
                                    ClearDrive
                                </span>
                            </div>
                            <p className="text-gray-400 leading-6 text-sm">
                                Helping thousands of learners prepare smarter for their US driving license exams.
                            </p>
                        </div>

                        {["Product", "Company", "Resources"].map(title => (
                            <div key={title}>
                                <h3 className="font-semibold mb-4">
                                    {title}
                                </h3>
                                <div className="space-y-2 text-gray-400">
                                    <a href="#" className="block hover:text-white transition text-sm">
                                        Features
                                    </a>
                                    <a href="#" className="block hover:text-white transition text-sm">
                                        Pricing
                                    </a>
                                    <a href="#" className="block hover:text-white transition text-sm">
                                        Support
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-800 mt-12 pt-6 text-center text-gray-500 text-sm">
                        © 2026 ClearDrive. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};