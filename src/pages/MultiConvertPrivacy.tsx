import Navigation from "@/components/Navigation";
import { NewsletterModal } from "@/components/NewsletterModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet";

const MultiConvertPrivacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy - MultiConvert</title>
        <meta name="description" content="Privacy Policy for the MultiConvert mobile application by Jibaro en la Luna LLC" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.jibaroenlaluna.com/multiconvert-privacy-policy" />
      </Helmet>

      <Navigation />
      <NewsletterModal />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground">
              This privacy policy applies to the MultiConvert app (hereby referred to as "Application") for mobile devices, created by Jibaro en la Luna LLC (hereby referred to as "Service Provider") as an Ad-Supported service. This service is intended for use "AS IS".
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Information Collection and Use</h3>
            <p className="text-muted-foreground">
              The Application collects information when you download and use it. This information may include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Your device's Internet Protocol address (e.g. IP address)</li>
              <li>The pages of the Application that you visit, the time and date of your visit, the time spent on those pages</li>
              <li>The time spent on the Application</li>
              <li>The operating system you use on your mobile device</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              The Application does not gather precise information about the location of your mobile device.
            </p>
            <p className="text-muted-foreground mt-4">
              The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.
            </p>
            <p className="text-muted-foreground mt-4">
              For a better experience, while using the Application, the Service Provider may require you to provide certain personally identifiable information, including but not limited to jribot@gmail.com. The information requested will be retained by the Service Provider and used as described in this privacy policy.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Advertising and Tracking (App Tracking Transparency)</h3>
            <p className="text-muted-foreground">
              MultiConvert displays advertisements through Google AdMob. To serve these ads, Google may collect and use a device advertising identifier (such as the Identifier for Advertisers, or IDFA) along with device information and general usage data, in accordance with its own privacy policy.
            </p>
            <p className="text-muted-foreground mt-4">
              On first launch, the Application will ask for your permission to track through Apple's App Tracking Transparency framework. You may decline. If you decline, ads will still be shown but will not be personalized.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Exchange Rate Data</h3>
            <p className="text-muted-foreground">
              The Application retrieves currency and cryptocurrency exchange rates from third-party services (Frankfurter for fiat currencies and CoinGecko for cryptocurrencies). These requests contain only the currency information needed to return rates and do not include any personal information about you.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">In-App Purchases</h3>
            <p className="text-muted-foreground">
              If you purchase the "Remove Ads" upgrade, the transaction is processed entirely by Apple through the App Store. The Service Provider does not receive or store your payment information.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Third Party Access</h3>
            <p className="text-muted-foreground">
              Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.
            </p>
            <p className="text-muted-foreground mt-4">
              The Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>
                <a href="https://support.google.com/admob/answer/6128543?hl=en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  AdMob
                </a>
              </li>
              <li>
                <a href="https://www.frankfurter.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Frankfurter
                </a>
              </li>
              <li>
                <a href="https://www.coingecko.com/en/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  CoinGecko
                </a>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              The Service Provider may disclose User Provided and Automatically Collected Information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>as required by law, such as to comply with a subpoena, or similar legal process;</li>
              <li>when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Opt-Out Rights</h3>
            <p className="text-muted-foreground">
              You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Data Retention Policy</h3>
            <p className="text-muted-foreground">
              The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you'd like them to delete User Provided Data that you have provided via the Application, please contact them at jribot@gmail.com and they will respond in a reasonable time.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Children</h3>
            <p className="text-muted-foreground">
              The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13. The Application is not directed to anyone under the age of 13.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Security</h3>
            <p className="text-muted-foreground">
              The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Changes</h3>
            <p className="text-muted-foreground">
              This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
            </p>
            <p className="text-muted-foreground mt-4">
              This privacy policy is effective as of July 12, 2026.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Your Consent</h3>
            <p className="text-muted-foreground">
              By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Contact Us</h3>
            <p className="text-muted-foreground">
              If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at{' '}
              <a href="mailto:jribot@gmail.com" className="text-primary hover:underline">
                jribot@gmail.com
              </a>.
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-muted py-8 px-4 text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Jibaro en la Luna LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default MultiConvertPrivacy;
