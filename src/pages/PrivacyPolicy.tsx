import Navigation from "@/components/Navigation";
import { NewsletterModal } from "@/components/NewsletterModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'} - Jibaro Tic Tac Toe</title>
        <meta name="description" content={language === 'es' ? 'Política de Privacidad para la aplicación móvil Jibaro Tic Tac Toe' : 'Privacy Policy for Jibaro Tic Tac Toe mobile application'} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://jibaroenaluna.com/privacy-policy" />
      </Helmet>

      <Navigation />
      <NewsletterModal />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">
              {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            {language === 'es' ? (
              <>
                <p className="text-muted-foreground">
                  Esta política de privacidad se aplica a la aplicación Jibaro Tic Tac Toe (en adelante referida como "Aplicación") para dispositivos móviles, creada por Jibaro en la luna llc (en adelante referido como "Proveedor de Servicios") como un servicio con Soporte de Anuncios. Este servicio está destinado a ser usado "TAL CUAL".
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Recopilación y Uso de Información</h3>
                <p className="text-muted-foreground">
                  La Aplicación recopila información cuando la descargas y la usas. Esta información puede incluir:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>La dirección de Protocolo de Internet de tu dispositivo (por ejemplo, dirección IP)</li>
                  <li>Las páginas de la Aplicación que visitas, la hora y fecha de tu visita, el tiempo dedicado a esas páginas</li>
                  <li>El tiempo dedicado en la Aplicación</li>
                  <li>El sistema operativo que usas en tu dispositivo móvil</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  La Aplicación no recopila información precisa sobre la ubicación de tu dispositivo móvil.
                </p>
                <p className="text-muted-foreground">
                  La Aplicación recopila la ubicación de tu dispositivo, lo que ayuda al Proveedor de Servicios a determinar tu ubicación geográfica aproximada y utilizarla de las siguientes maneras:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Servicios de Geolocalización:</strong> El Proveedor de Servicios utiliza datos de ubicación para proporcionar funciones como contenido personalizado, recomendaciones relevantes y servicios basados en la ubicación.</li>
                  <li><strong>Análisis y Mejoras:</strong> Los datos de ubicación agregados y anonimizados ayudan al Proveedor de Servicios a analizar el comportamiento del usuario, identificar tendencias y mejorar el rendimiento general y la funcionalidad de la Aplicación.</li>
                  <li><strong>Servicios de Terceros:</strong> Periódicamente, el Proveedor de Servicios puede transmitir datos de ubicación anonimizados a servicios externos. Estos servicios les ayudan a mejorar la Aplicación y optimizar sus ofertas.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  El Proveedor de Servicios puede usar la información que proporcionaste para contactarte de vez en cuando para brindarte información importante, avisos necesarios y promociones de marketing.
                </p>
                <p className="text-muted-foreground">
                  Para una mejor experiencia, mientras usas la Aplicación, el Proveedor de Servicios puede requerir que nos proporciones cierta información de identificación personal, incluyendo pero no limitado a jribot@gmail.com. La información que el Proveedor de Servicios solicite será retenida por ellos y utilizada como se describe en esta política de privacidad.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Acceso de Terceros</h3>
                <p className="text-muted-foreground">
                  Solo se transmiten periódicamente datos agregados y anonimizados a servicios externos para ayudar al Proveedor de Servicios a mejorar la Aplicación y su servicio. El Proveedor de Servicios puede compartir tu información con terceros de las maneras descritas en esta declaración de privacidad.
                </p>
                <p className="text-muted-foreground">
                  Ten en cuenta que la Aplicación utiliza servicios de terceros que tienen su propia Política de Privacidad sobre el manejo de datos. A continuación se encuentran los enlaces a la Política de Privacidad de los proveedores de servicios de terceros utilizados por la Aplicación:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>
                    <a href="https://support.google.com/admob/answer/6128543?hl=en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      AdMob
                    </a>
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  El Proveedor de Servicios puede divulgar Información Proporcionada por el Usuario e Información Recopilada Automáticamente:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>según lo requiera la ley, como para cumplir con una citación o proceso legal similar;</li>
                  <li>cuando creen de buena fe que la divulgación es necesaria para proteger sus derechos, proteger tu seguridad o la seguridad de otros, investigar fraude o responder a una solicitud gubernamental;</li>
                  <li>con sus proveedores de servicios de confianza que trabajan en su nombre, no tienen un uso independiente de la información que les divulgamos y han acordado adherirse a las reglas establecidas en esta declaración de privacidad.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Derechos de Exclusión</h3>
                <p className="text-muted-foreground">
                  Puedes detener toda la recopilación de información por parte de la Aplicación fácilmente desinstalándola. Puedes usar los procesos de desinstalación estándar que pueden estar disponibles como parte de tu dispositivo móvil o a través del mercado de aplicaciones móviles o red.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Política de Retención de Datos</h3>
                <p className="text-muted-foreground">
                  El Proveedor de Servicios retendrá los datos proporcionados por el Usuario mientras uses la Aplicación y durante un tiempo razonable después. Si deseas que eliminen los Datos Proporcionados por el Usuario que has proporcionado a través de la Aplicación, contáctalos en jribot@gmail.com y responderán en un tiempo razonable.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Niños</h3>
                <p className="text-muted-foreground">
                  El Proveedor de Servicios no usa la Aplicación para solicitar datos o comercializar conscientemente a niños menores de 13 años.
                </p>
                <p className="text-muted-foreground">
                  La Aplicación no está dirigida a ninguna persona menor de 13 años. El Proveedor de Servicios no recopila conscientemente información de identificación personal de niños menores de 13 años. En caso de que el Proveedor de Servicios descubra que un niño menor de 13 años ha proporcionado información personal, la eliminará inmediatamente de sus servidores. Si eres padre o tutor y sabes que tu hijo nos ha proporcionado información personal, contacta al Proveedor de Servicios (jribot@gmail.com) para que puedan tomar las acciones necesarias.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Seguridad</h3>
                <p className="text-muted-foreground">
                  El Proveedor de Servicios está preocupado por salvaguardar la confidencialidad de tu información. El Proveedor de Servicios proporciona salvaguardas físicas, electrónicas y de procedimiento para proteger la información que procesa y mantiene.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Cambios</h3>
                <p className="text-muted-foreground">
                  Esta Política de Privacidad puede actualizarse de vez en cuando por cualquier motivo. El Proveedor de Servicios te notificará de cualquier cambio a la Política de Privacidad actualizando esta página con la nueva Política de Privacidad. Se te aconseja consultar esta Política de Privacidad regularmente para cualquier cambio, ya que el uso continuo se considera aprobación de todos los cambios.
                </p>
                <p className="text-muted-foreground">
                  Esta política de privacidad es efectiva a partir del 2025-11-17
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Tu Consentimiento</h3>
                <p className="text-muted-foreground">
                  Al usar la Aplicación, estás dando tu consentimiento para el procesamiento de tu información como se establece en esta Política de Privacidad ahora y según la modifiquemos.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Contáctanos</h3>
                <p className="text-muted-foreground">
                  Si tienes alguna pregunta sobre la privacidad mientras usas la Aplicación, o tienes preguntas sobre las prácticas, contacta al Proveedor de Servicios por correo electrónico en jribot@gmail.com.
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  This privacy policy applies to the Jibaro Tic Tac Toe app (hereby referred to as "Application") for mobile devices that was created by Jibaro en la luna llc (hereby referred to as "Service Provider") as an Ad Supported service. This service is intended for use "AS IS".
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Information Collection and Use</h3>
                <p className="text-muted-foreground">
                  The Application collects information when you download and use it. This information may include information such as:
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
                <p className="text-muted-foreground">
                  The Application collects your device's location, which helps the Service Provider determine your approximate geographical location and make use of in below ways:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Geolocation Services:</strong> The Service Provider utilizes location data to provide features such as personalized content, relevant recommendations, and location-based services.</li>
                  <li><strong>Analytics and Improvements:</strong> Aggregated and anonymized location data helps the Service Provider to analyze user behavior, identify trends, and improve the overall performance and functionality of the Application.</li>
                  <li><strong>Third-Party Services:</strong> Periodically, the Service Provider may transmit anonymized location data to external services. These services assist them in enhancing the Application and optimizing their offerings.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.
                </p>
                <p className="text-muted-foreground">
                  For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information, including but not limited to jribot@gmail.com. The information that the Service Provider request will be retained by them and used as described in this privacy policy.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Third Party Access</h3>
                <p className="text-muted-foreground">
                  Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.
                </p>
                <p className="text-muted-foreground">
                  Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>
                    <a href="https://support.google.com/admob/answer/6128543?hl=en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      AdMob
                    </a>
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  The Service Provider may disclose User Provided and Automatically Collected Information:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>as required by law, such as to comply with a subpoena, or similar legal process;</li>
                  <li>when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;</li>
                  <li>with their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.</li>
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
                  The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
                </p>
                <p className="text-muted-foreground">
                  The Application does not address anyone under the age of 13. The Service Provider does not knowingly collect personally identifiable information from children under 13 years of age. In the case the Service Provider discover that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider (jribot@gmail.com) so that they will be able to take the necessary actions.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Security</h3>
                <p className="text-muted-foreground">
                  The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Changes</h3>
                <p className="text-muted-foreground">
                  This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
                </p>
                <p className="text-muted-foreground">
                  This privacy policy is effective as of 2025-11-17
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Your Consent</h3>
                <p className="text-muted-foreground">
                  By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at jribot@gmail.com.
                </p>
              </>
            )}

            <hr className="my-6 border-border" />
            
            <p className="text-xs text-muted-foreground text-center">
              This privacy policy page was generated by{' '}
              <a href="https://app-privacy-policy-generator.nisrulz.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                App Privacy Policy Generator
              </a>
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-muted py-8 px-4 text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Jibaro en la luna llc. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
