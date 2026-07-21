import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    Award,
    Star,
    Shield,
    Zap,
    Play,
} from 'lucide-react';
import { ROUTES } from '../../constants';

const features = [
    {
        icon: BookOpen,
        title: '1000+ Practice Questions',
        description: 'Comprehensive question bank covering all DMV test topics with detailed explanations.',
    },
    {
        icon: Shield,
        title: 'Real Test Simulation',
        description: 'Experience tests that mirror the actual DMV exam format with timed sessions.',
    },
    {
        icon: Award,
        title: 'Smart Progress Tracking',
        description: 'Advanced analytics to monitor your performance and identify weak areas.',
    },
    {
        icon: Zap,
        title: 'State-Specific Content',
        description: 'Questions tailored to your state\'s driving laws with regular updates.',
    },
];

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'Passed on first try',
        content: 'ClearDrive made preparing for my license test so easy. The practice tests were exactly like the real thing!',
        rating: 5,
        initial: 'SJ',
    },
    {
        name: 'Mike Chen',
        role: 'Scored 98%',
        content: 'The detailed explanations after each question helped me understand the rules better than just memorizing.',
        rating: 5,
        initial: 'MC',
    },
    {
        name: 'Emily Davis',
        role: 'Got license in 2 weeks',
        content: 'I was nervous about the test but after practicing here, I felt completely confident. Highly recommend!',
        rating: 5,
        initial: 'ED',
    },
];

export default function LandingPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-28 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 backdrop-blur-md px-5 py-2 text-blue-700 shadow-md mb-6">
                            <Star className="h-4 w-4 fill-current" />
                            Trusted by 50,000+ learners
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-gray-900 max-w-6xl">
                            Ace Your
                            <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent">
                                Driving Test
                            </span>
                            With Confidence
                        </h1>

                        <p className="mt-6 max-w-3xl text-xl text-gray-600 leading-9">
                            Master your US driving license test with AI-powered practice
                            questions, realistic simulations, personalized learning paths,
                            and real exam experience.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Link to={ROUTES.SIGNUP}>
                                <button className="px-10 py-4 rounded-xl bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition flex items-center gap-2">
                                    Start Free Trial
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </Link>
                            <button className="px-10 py-4 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 hover:border-blue-300 shadow-lg transition flex items-center gap-2">
                                <Play className="h-5 w-5" />
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Reduced padding */}
            <section id="features" className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
                            FEATURES
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                            Everything You Need to
                            <span className="text-blue-600">
                                {" "}Pass Your Test
                            </span>
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                            Learn smarter with AI-powered practice, state-specific questions,
                            real exam simulations and detailed explanations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    className="group rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/60 p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-500"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-blue-100/80 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                                        <Icon className="h-7 w-7 text-blue-600 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-6 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Reduced padding */}
            <section id="testimonials" className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            TESTIMONIALS
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                            Loved by
                            <span className="text-blue-600">
                                {" "}Thousands
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 mt-4">
                            Join thousands who passed their DMV test on the first try.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.name}
                                className="rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/60 p-6 shadow-lg hover:shadow-2xl transition"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-4 w-4 text-yellow-400 fill-yellow-400"
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-700 leading-7 mb-6 text-sm">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                                        {testimonial.initial}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">
                                            {testimonial.name}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Reduced padding */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 px-8 py-16 text-center shadow-2xl">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl" />
                        <div className="relative">
                            <h2 className="text-4xl lg:text-5xl font-bold text-white">
                                Ready to Get Your License?
                            </h2>
                            <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto">
                                Join over 50,000 learners and pass your DMV test with confidence.
                            </p>
                            <Link to={ROUTES.SIGNUP}>
                                <button className="mt-8 px-10 py-4 rounded-xl bg-white text-blue-600 font-bold shadow-xl hover:scale-105 transition">
                                    Start Free Trial
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}