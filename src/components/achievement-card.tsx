import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import React from "react";
import { Icons } from "@/components/icons";

interface Props {
  title: string;
  subtitle?: string;
  description?: string;
  issueDate?: string;
  image?: string;
  link?: string;
}

export function AchievementCard({
  title,
  subtitle,
  description,
  issueDate,
  image,
  link,
}: Props) {
  return (
    <li className="relative ml-10 py-4">
      <div className="absolute -left-16 top-2 flex items-center justify-center bg-white rounded-full">
        <Avatar className="border size-12 m-auto">
          <AvatarImage src={image} alt={title} className="object-contain" />
          <AvatarFallback>{title[0]}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-1 flex-col justify-start gap-1">
        {issueDate && (
          <time className="text-xs text-muted-foreground">{issueDate}</time>
        )}
        <h2 className="font-semibold leading-none">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        {description && (
          <span className="prose dark:prose-invert text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </div>
      {link && (
        <div className="mt-2 flex flex-row flex-wrap items-start gap-2">
          <Link href={link} target="_blank" rel="noopener noreferrer">
            <Badge className="flex gap-2 items-center">
              <span className="w-4 h-4 mr-1 inline-flex items-center justify-center">
                {Icons.globe({})}
              </span>
              View Certificate
            </Badge>
          </Link>
        </div>
      )}
    </li>
  );
} 