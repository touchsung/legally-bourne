import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "I know nothing about law, but this let me write a letter to get my money back.",
      name: "Sarah Chen",
      initials: "SC",
    },
    {
      quote:
        "Finally, legal help that speaks my language. No confusing jargon.",
      name: "Mike Rodriguez",
      initials: "MR",
    },
    {
      quote: "Saved me hundreds in lawyer fees. The AI guidance was spot-on.",
      name: "Emily Johnson",
      initials: "EJ",
    },
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What our users say
          </h2>
          <p className="text-xl text-gray-600">
            Real people getting real results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <blockquote className="text-gray-900 text-lg mb-6 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </blockquote>

                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {testimonial.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
