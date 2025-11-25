import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  AlertCircle, 
  Trash2, 
  Star,
  Settings,
  Download,
  Plus
} from 'lucide-react'

/**
 * Composant de démonstration des boutons avec la palette de couleurs personnalisée HSL
 * 
 * Variantes disponibles :
 * - default (primary) : Couleur principale bleue
 * - secondary : Couleur secondaire orange
 * - danger : Rouge pour les actions destructives
 * - warning : Jaune pour les avertissements
 * - success : Vert pour les actions de succès
 * - info : Bleu pour les informations
 * - destructive : Alias pour danger (compatibilité shadcn/ui)
 */
export function ButtonDemo() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Palette de Boutons Personnalisée HSL
          </CardTitle>
          <CardDescription>
            Démonstration des variantes de boutons avec votre palette de couleurs cohérente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Boutons principaux */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Boutons Principaux</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">
                <Settings className="w-4 h-4 mr-2" />
                Principal (Default)
              </Button>
              <Button variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Secondaire
              </Button>
            </div>
          </div>

          {/* Boutons sémantiques */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Boutons Sémantiques</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="success">
                <CheckCircle className="w-4 h-4 mr-2" />
                Succès
              </Button>
              <Button variant="warning">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Avertissement
              </Button>
              <Button variant="danger">
                <Trash2 className="w-4 h-4 mr-2" />
                Danger
              </Button>
              <Button variant="info">
                <Info className="w-4 h-4 mr-2" />
                Information
              </Button>
            </div>
          </div>

          {/* Différentes tailles */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Tailles Disponibles</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="success" size="sm">
                <Plus className="w-3 h-3 mr-1" />
                Petit
              </Button>
              <Button variant="warning" size="default">
                <AlertCircle className="w-4 h-4 mr-2" />
                Normal
              </Button>
              <Button variant="danger" size="lg">
                <Trash2 className="w-5 h-5 mr-2" />
                Grand
              </Button>
              <Button variant="info" size="icon">
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Variantes spéciales */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Variantes Spéciales</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                Outline
              </Button>
              <Button variant="ghost">
                Ghost
              </Button>
              <Button variant="link">
                Lien
              </Button>
              <Button variant="destructive">
                Destructive (Legacy)
              </Button>
            </div>
          </div>

          {/* États désactivés */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">États Désactivés</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="success" disabled>
                Succès Désactivé
              </Button>
              <Button variant="warning" disabled>
                Warning Désactivé
              </Button>
              <Button variant="danger" disabled>
                Danger Désactivé
              </Button>
              <Button variant="info" disabled>
                Info Désactivé
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Exemples d'utilisation pratique */}
      <Card>
        <CardHeader>
          <CardTitle>Exemples d'Utilisation Pratique</CardTitle>
          <CardDescription>
            Comment utiliser les boutons dans des contextes réels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Actions de formulaire */}
          <div className="space-y-3">
            <h4 className="font-medium">Actions de Formulaire</h4>
            <div className="flex gap-2">
              <Button variant="success">
                <CheckCircle className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              <Button variant="danger">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
              <Button variant="outline">
                Annuler
              </Button>
            </div>
          </div>

          {/* Notifications et alertes */}
          <div className="space-y-3">
            <h4 className="font-medium">Notifications et Alertes</h4>
            <div className="flex gap-2">
              <Button variant="info" size="sm">
                <Info className="w-3 h-3 mr-1" />
                Voir Détails
              </Button>
              <Button variant="warning" size="sm">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Attention
              </Button>
              <Button variant="success" size="sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirmer
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

// Exemples d'utilisation pour la documentation :
/*

// Bouton de succès
<Button variant="success">
  <CheckCircle className="w-4 h-4 mr-2" />
  Enregistrer
</Button>

// Bouton d'avertissement
<Button variant="warning">
  <AlertTriangle className="w-4 h-4 mr-2" />
  Attention
</Button>

// Bouton de danger
<Button variant="danger">
  <Trash2 className="w-4 h-4 mr-2" />
  Supprimer
</Button>

// Bouton d'information
<Button variant="info">
  <Info className="w-4 h-4 mr-2" />
  En savoir plus
</Button>

*/ 