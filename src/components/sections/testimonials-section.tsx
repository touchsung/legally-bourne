import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Business Owner",
      image: "/api/placeholder/60/60",
      quote:
        "Within minutes about my landlord tenant matter. They're professional and solved it.",
    },
    {
      name: "Retail Store Owner",
      image: "/api/placeholder/60/60",
      quote:
        "The team handled my the contract review dispute was very thorough, Conforming everything.",
    },
    {
      name: "Business Owner",
      image: "/api/placeholder/60/60",
      quote:
        "Great professional and confidential legal service. That AI guidance was excellent.",
    },
    {
      name: "Franchise Owner",
      image: "/api/placeholder/60/60",
      quote:
        "I was stressed about employment matter. They all guidance and support.",
    },
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">
          What our users say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </p>
                </div>
              </div>
              <blockquote className="text-gray-700 text-sm leading-relaxed">
                &quot;{testimonial.quote}&quot;
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
