import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function UnderConstructionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl ">
        <div className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <Image
              src="/under-construction.svg"
              alt="Under Construction"
              width={300}
              height={200}
              className="w-full max-w-sm h-auto"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              We're Building Something Amazing!
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Our website is currently under construction. We're working hard to
              bring you something incredible. Stay tuned!
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="px-4 py-2 rounded-full text-sm font-medium">
                🚧 Coming Soon
              </div>
            </div>

            <Button className="text-white px-8 py-2" asChild>
              <Link href="/">Take me back</Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Expected launch: Coming Soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
