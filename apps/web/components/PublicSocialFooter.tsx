"use client";

import { SOCIAL_LINKS } from "@/lib/social-links";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14.2 8.6H16V5.4C15.7 5.3 14.7 5.2 13.4 5.2C10.8 5.2 9 6.8 9 9.8V12.5H6V16H9V23H12.7V16H15.5L16 12.5H12.7V10.2C12.7 9.2 13 8.6 14.2 8.6Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.8 3C17.1 5.3 18.5 6.8 21 7V10.5C19.6 10.6 18.2 10.2 16.9 9.3V15.7C16.9 19.2 14.6 21.5 11.4 21.5C8.3 21.5 6 19.3 6 16.4C6 13.3 8.5 11 12.2 11.2V14.8C10.7 14.6 9.7 15.2 9.7 16.3C9.7 17.2 10.4 17.8 11.4 17.8C12.5 17.8 13.2 17.1 13.2 15.8V3H16.8Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 4.5L8.8 4C9.4 3.9 10 4.2 10.2 4.8L11.1 7.1C11.3 7.6 11.2 8.1 10.8 8.5L9.7 9.6C10.6 11.5 12.1 13 14 13.9L15.1 12.8C15.5 12.4 16 12.3 16.5 12.5L18.9 13.4C19.5 13.6 19.8 14.2 19.7 14.8L19.2 17.1C19.1 17.8 18.5 18.3 17.8 18.3C10.9 18.3 5.3 12.7 5.3 5.8C5.3 5.1 5.8 4.6 6.5 4.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21C12 21 19 14.7 19 8.8C19 5 15.9 2 12 2C8.1 2 5 5 5 8.8C5 14.7 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="8.8" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function PublicSocialFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 pb-8 pt-5 text-white md:mt-12">
      <div className="flex flex-col items-center justify-between gap-4 text-sm font-semibold text-blue-100 md:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <a
            href={SOCIAL_LINKS.phone}
            className="inline-flex items-center gap-2 transition hover:text-cyan-200"
          >
            <PhoneIcon />
            <span>304 380 0967</span>
          </a>

          <a
            href={SOCIAL_LINKS.maps}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-cyan-200"
          >
            <MapsIcon />
            <span>Carrera 31 # 8-60</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-black text-white">
          <a
            href={SOCIAL_LINKS.instagram}
            target={SOCIAL_LINKS.instagram === "#" ? undefined : "_blank"}
            rel={SOCIAL_LINKS.instagram === "#" ? undefined : "noreferrer"}
            className="inline-flex items-center gap-2 transition hover:text-cyan-200"
          >
            <InstagramIcon />
            <span>Instagram</span>
          </a>

          <a
            href={SOCIAL_LINKS.facebook}
            target={SOCIAL_LINKS.facebook === "#" ? undefined : "_blank"}
            rel={SOCIAL_LINKS.facebook === "#" ? undefined : "noreferrer"}
            className="inline-flex items-center gap-2 transition hover:text-cyan-200"
          >
            <FacebookIcon />
            <span>Facebook</span>
          </a>

          <a
            href={SOCIAL_LINKS.tiktok}
            target={SOCIAL_LINKS.tiktok === "#" ? undefined : "_blank"}
            rel={SOCIAL_LINKS.tiktok === "#" ? undefined : "noreferrer"}
            className="inline-flex items-center gap-2 transition hover:text-cyan-200"
          >
            <TikTokIcon />
            <span>TikTok</span>
          </a>
        </div>
      </div>

      <p className="mt-5 text-center text-xs font-semibold text-blue-200/80">
        © 2026 Andrés Burger. Todos los derechos reservados.
      </p>
    </footer>
  );
}
