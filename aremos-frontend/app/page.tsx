"use client"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div
      className="min-h-screen bg-aremos-bg"
      style={{
        backgroundImage: "url(/images/landing-background.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <a href="#hero" className="flex items-center gap-3 cursor-pointer">
          <img src="/images/aremos-logo.png" alt="AREMOS Logo" className="w-12 h-12" />
          <span className="text-xl font-bold text-aremos-dark font-serif">AREMOS</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("mission")}
            className="hover:text-aremos-dark transition-colors font-serif font-bold"
            style={{ color: "#121A4C" }}
          >
            Mission
          </button>
          <button
            onClick={() => scrollToSection("konzept")}
            className="hover:text-aremos-dark transition-colors font-serif font-bold"
            style={{ color: "#121A4C" }}
          >
            Konzept
          </button>
          <button
            onClick={() => scrollToSection("rechtliches")}
            className="hover:text-aremos-dark transition-colors font-serif font-bold"
            style={{ color: "#121A4C" }}
          >
            Rechtliches
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/login">
            <Button
              variant="outline"
              className="text-aremos-dark hover:bg-aremos-light bg-transparent font-bold"
              style={{ borderColor: "#121A4C" }}
            >
              Anmelden
            </Button>
          </a>
          <a href="/login?mode=register">
            <Button
              className="bg-aremos-dark hover:bg-aremos-primary text-aremos-bg font-bold"
              style={{ borderColor: "#121A4C" }}
            >
              Registrieren
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main
        id="hero"
        className="flex flex-col lg:flex-row items-center justify-between px-6 py-12 lg:px-12 lg:py-20 gap-12"
      >
        <div className="flex-1 max-w-xl">
          <h1 className="text-5xl lg:text-7xl font-bold text-aremos-dark leading-tight mb-8 font-serif">
            ENTFALTE
            <br />
            DEIN VOLLES
            <br />
            POTENZIAL
          </h1>

          <p className="text-lg mb-8 leading-relaxed" style={{ color: "#121A4C" }}>
            AREMOS ist die digitale Brücke zwischen klassischem
            <br />
            Unterricht und nachhaltigem Lernen.
          </p>

          <div className="flex gap-4">
            <a href="/login?mode=register">
              <Button className="bg-aremos-dark hover:bg-aremos-primary text-aremos-bg px-8 py-3 text-lg">
                Loslegen
              </Button>
            </a>
            <a href="/login">
              <Button
                variant="outline"
                className="text-aremos-dark hover:bg-aremos-light px-8 py-3 text-lg bg-transparent font-bold"
                style={{ borderColor: "#121A4C" }}
              >
                Anmelden
              </Button>
            </a>
          </div>
        </div>

        <div className="flex-1 relative max-w-xl">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Landing.PNG-d8KdAyl16oteq1aaD7MTg3q9b3ErEj.png"
            alt="AREMOS Digital Learning Platform"
            className="w-full h-auto"
          />
        </div>
      </main>

      {/* Mission Section */}
      <section id="mission" className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-aremos-light/30 to-aremos-medium/20 rounded-3xl blur-xl"></div>

            <div
              className="relative backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl border border-aremos-light/50"
              style={{ backgroundColor: "#98B7D4" }}
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl lg:text-5xl font-bold text-aremos-dark font-serif">Unsere Mission</h2>
              </div>

              <div className="text-aremos-dark text-lg leading-relaxed space-y-6 max-w-4xl mx-auto">
                <p className="text-xl font-medium text-aremos-primary mb-8 text-center">
                  Wissenschaftlich bewährte Lernmethoden für nachhaltigen Bildungserfolg
                </p>

                <p>
                  AREMOS verfolgt die Mission, das schulische Lernen grundlegend zu optimieren und den nachhaltigen
                  Wissenserwerb für Lehrkräfte und Lernende gleichermaßen zugänglich zu machen. Unser Ziel ist es,
                  wissenschaftlich bewährte Methoden wie Spaced Repetition und Active Recall in einen klar
                  strukturierten, intuitiv nutzbaren Rahmen zu integrieren, der sich flexibel in allen
                  Unterrichtsfächern und Jahrgangsstufen einsetzen lässt. Dieser Rahmen ist so konzipiert, dass er nicht
                  nur diese Kernprinzipien unterstützt, sondern zugleich die Einbindung einer Vielzahl weiterer
                  hochwirksamer Lernstrategien ermöglicht, die den Lernerfolg gezielt verbessern.
                </p>

                <p>
                  Wir möchten Lehrkräften ein Werkzeug an die Hand geben, das ohne technische Hürden auskommt, ihren
                  Unterricht sinnvoll ergänzt und dennoch volle pädagogische Kontrolle gewährleistet. Gleichzeitig soll
                  AREMOS Schülerinnen und Schülern helfen, Lerninhalte dauerhaft zu verankern, Prüfungsphasen zu
                  entlasten und Lernstress zu reduzieren.
                </p>

                <p>
                  Dabei legen wir höchsten Wert auf Datensparsamkeit und eine Gestaltung, die sowohl im schulischen
                  Kontext als auch im individuellen Lernen nahtlos funktioniert. AREMOS steht für einen evidenzbasierten
                  Bildungsansatz, der Zeitressourcen schont, Motivation fördert und den Lernerfolg messbar steigert.
                  Unsere Vision ist es, einen neuen Standard im schulischen Lernen zu etablieren – nachhaltig, wirksam
                  und zukunftsfähig.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Konzept Section */}
      <section id="konzept" className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-aremos-dark mb-4 font-serif">Unser Konzept</h2>
            <p className="text-xl text-aremos-primary max-w-3xl mx-auto">
              Drei Säulen für effektives und nachhaltiges Lernen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Recall Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-aremos-primary/20 to-aremos-dark/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div
                className="relative backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-aremos-light/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-80"
                style={{ backgroundColor: "#98B7D4" }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-aremos-dark font-serif">Active Recall</h3>
                </div>
                <p className="text-aremos-dark text-sm leading-relaxed">
                  Active Recall – das aktive Abrufen von Wissen – und die damit verbundene Methode der Spaced Repetition
                  bilden das Kernkonzept von AREMOS. Diese wissenschaftlich bewährte Kombination lässt sich ideal
                  technisch umsetzen, ohne die pädagogische Freiheit der Lehrkräfte einzuschränken. So entsteht ein
                  flexibler Rahmen für nachhaltiges, effizientes Lernen.
                </p>
              </div>
            </div>

            {/* Lernkontrolle Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-aremos-medium/20 to-aremos-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div
                className="relative backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-aremos-light/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-80"
                style={{ backgroundColor: "#98B7D4" }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-aremos-dark font-serif">Lernkontrolle</h3>
                </div>
                <p className="text-aremos-dark text-sm leading-relaxed">
                  Die Kontrollfunktion von AREMOS gibt Lehrkräften schnell präzisen Einblick in Zeitaufwand und
                  Antwortverhalten ihrer Schüler. So lässt sich in wenigen Sekunden erkennen, ob konsequent gelernt
                  wird. Bei Auffälligkeiten können Lehrkräfte gezielt eingreifen und individuelle Unterstützung bieten –
                  effizient, übersichtlich und ohne Zusatzaufwand.
                </p>
              </div>
            </div>

            {/* Gestaltungsfreiheit Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-aremos-light/30 to-aremos-medium/15 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div
                className="relative backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-aremos-light/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-80"
                style={{ backgroundColor: "#98B7D4" }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-aremos-dark font-serif">Gestaltungsfreiheit</h3>
                </div>
                <p className="text-aremos-dark text-sm leading-relaxed">
                  In AREMOS gestalten Lehrkräfte ihre Flashcards unabhängig und können beliebige zusätzliche
                  Lernmethoden integrieren. Sie bestimmen Struktur, Fragen und Tiefe des Materials selbst. So behalten
                  sie die volle Kontrolle über Inhalt und Didaktik – und können die Wissensvermittlung exakt an ihre
                  pädagogischen Ziele und den Unterrichtsfortschritt anpassen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rechtliches Section */}
      <section id="rechtliches" className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-aremos-dark mb-4 font-serif">Rechtliches</h2>
            <p className="text-xl text-aremos-primary">Transparenz und Datenschutz stehen bei uns an erster Stelle</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Impressum Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-aremos-primary/15 to-aremos-dark/10 rounded-2xl blur-xl"></div>
              <div
                className="relative backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-aremos-light/30 hover:shadow-2xl transition-all duration-300"
                style={{ backgroundColor: "#98B7D4" }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-aremos-dark font-serif">Impressum</h3>
                </div>

                <div className="text-aremos-dark text-base leading-relaxed space-y-4">
                  <div>
                    <p>Angaben gemäß § 5 TMG</p>
                    <p>[Firmenname]</p>
                    <p>[Straße und Hausnummer]</p>
                    <p>[PLZ Ort]</p>
                    <p>Deutschland</p>
                  </div>

                  <div>
                    <p>Handelsregister: [HRB-Nummer]</p>
                    <p>Registergericht: [Amtsgericht]</p>
                  </div>

                  <div>
                    <p>Vertreten durch: [Name], Geschäftsführer</p>
                  </div>

                  <div>
                    <p>Kontakt</p>
                    <p>Telefon: [Telefonnummer]</p>
                    <p>E-Mail: [E-Mail-Adresse]</p>
                  </div>

                  <div>
                    <p>Umsatzsteuer-ID</p>
                    <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [USt-ID]</p>
                  </div>

                  <div>
                    <p>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</p>
                    <p>[Firmenname], [Adresse]</p>
                  </div>

                  <div>
                    <p>Haftungsausschluss</p>
                    <p>Wir übernehmen keine Haftung für erstelle Inhalte.</p>
                    <p>Für diese Inhalte sind ausschließlich deren Ersteller</p>
                    <p>verantwortlich.</p>
                  </div>

                  <div>
                    <p>Urheberrecht</p>
                    <p>Die Inhalte dieser Website unterliegen dem deutschen</p>
                    <p>Urheberrecht.</p>
                    <p>Vervielfältigung, Bearbeitung oder Verbreitung bedürfen</p>
                    <p>der schriftlichen Zustimmung des Rechteinhabers.</p>
                  </div>

                  <div>
                    <p>
                      Für die Erstellung wurde unter anderem{" "}
                      <button
                        onClick={() => window.open("#", "_blank")}
                        className="hover:text-aremos-dark underline font-medium"
                        style={{ color: "#4176A4" }}
                      >
                        Open Source Code
                      </button>{" "}
                      verwendet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Datenschutz & Lizensierung Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-aremos-medium/15 to-aremos-light/20 rounded-2xl blur-xl"></div>
              <div
                className="relative backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-aremos-light/30 hover:shadow-2xl transition-all duration-300"
                style={{ backgroundColor: "#98B7D4" }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-aremos-dark font-serif">Datenschutz & Lizensierung</h3>
                </div>

                <div className="text-aremos-dark text-base leading-relaxed space-y-4">
                  <p>
                    AREMOS verarbeitet ausschließlich die Daten, die für den Betrieb der Plattform zwingend erforderlich
                    sind. Zur Erstellung eines Nutzerprofils werden keine E-Mail-Adressen, Telefonnummern oder andere
                    persönlichen Identifikatoren erhoben. Die Registrierung erfolgt ausschließlich mittels Benutzername,
                    Passwort und einem gültigen Lizenzcode. Es werden keine Tracking- oder Analyse-Tools verwendet und
                    keinerlei Daten an Dritte weitergegeben. Alle Informationen werden innerhalb der Europäischen Union
                    gespeichert und unterliegen den geltenden Datenschutzgesetzen. Lehrkräfte erhalten ausschließlich
                    Einsicht in lernrelevante Kennzahlen. Mit der Nutzung von AREMOS erklären Sie sich mit dieser Form
                    der Datenerhebung und -verarbeitung einverstanden.
                  </p>

                  <p>
                    Die Nutzung von AREMOS ist ausschließlich mit einer gültigen, jährlich erneuerten Schullizenz
                    gestattet. Jede lizenzierte Schule erhält hierfür einen individuellen Lizenzcode, der für die
                    Erstellung und Nutzung von Benutzerkonten erforderlich ist. Dieser Code wird von der Schule an
                    berechtigte Nutzer ausgegeben und darf nicht an unbefugte Dritte weitergegeben werden. Eine Nutzung
                    ohne gültige Lizenz ist strikt untersagt und wird rechtliche Schritte nach sich ziehen. AREMOS
                    behält sich das Recht vor, bei Verdacht auf Missbrauch oder unberechtiger Nutzung den Zugang
                    umgehend zu sperren und die zuständigen Stellen zu informieren. Durch die Verwendung von AREMOS
                    erkennen alle Nutzer diese Bestimmungen an und verpflichten sich zu deren Einhaltung.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
