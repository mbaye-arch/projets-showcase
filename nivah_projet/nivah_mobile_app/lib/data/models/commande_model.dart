/// Modèle Commande
class CommandeModel {
  final int id;
  final int clientId;
  final String numeroCommande;
  final double montantTotal;
  final String statut;
  final String? adresseLivraison;
  final String? telephoneLivraison;
  final String? notesLivraison;
  final String modePaiement;
  final String statutPaiement;
  final String? transactionId;
  final DateTime? dateLivraison;
  final String? clientNom;
  final String? clientPrenom;
  final String? clientEmail;
  final List<CommandeItemModel>? items;
  final DateTime createdAt;
  final DateTime updatedAt;

  CommandeModel({
    required this.id,
    required this.clientId,
    required this.numeroCommande,
    required this.montantTotal,
    this.statut = 'en_attente',
    this.adresseLivraison,
    this.telephoneLivraison,
    this.notesLivraison,
    this.modePaiement = 'paydunya',
    this.statutPaiement = 'en_attente',
    this.transactionId,
    this.dateLivraison,
    this.clientNom,
    this.clientPrenom,
    this.clientEmail,
    this.items,
    required this.createdAt,
    required this.updatedAt,
  });

  // From JSON
  factory CommandeModel.fromJson(Map<String, dynamic> json) {
    return CommandeModel(
      id: json['id'] as int,
      clientId: json['client_id'] as int,
      numeroCommande: json['numero_commande'] as String,
      montantTotal: double.parse(json['montant_total'].toString()),
      statut: json['statut'] as String? ?? 'en_attente',
      adresseLivraison: json['adresse_livraison'] as String?,
      telephoneLivraison: json['telephone_livraison'] as String?,
      notesLivraison: json['notes_livraison'] as String?,
      modePaiement: json['mode_paiement'] as String? ?? 'paydunya',
      statutPaiement: json['statut_paiement'] as String? ?? 'en_attente',
      transactionId: json['transaction_id'] as String?,
      dateLivraison: json['date_livraison'] != null
          ? DateTime.parse(json['date_livraison'] as String)
          : null,
      clientNom: json['client_nom'] as String?,
      clientPrenom: json['client_prenom'] as String?,
      clientEmail: json['client_email'] as String?,
      items: json['items'] != null
          ? (json['items'] as List)
              .map((item) => CommandeItemModel.fromJson(item as Map<String, dynamic>))
              .toList()
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  // To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'client_id': clientId,
      'numero_commande': numeroCommande,
      'montant_total': montantTotal,
      'statut': statut,
      'adresse_livraison': adresseLivraison,
      'telephone_livraison': telephoneLivraison,
      'notes_livraison': notesLivraison,
      'mode_paiement': modePaiement,
      'statut_paiement': statutPaiement,
      'transaction_id': transactionId,
      'date_livraison': dateLivraison?.toIso8601String(),
      'client_nom': clientNom,
      'client_prenom': clientPrenom,
      'client_email': clientEmail,
      'items': items?.map((item) => item.toJson()).toList(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Statut lisible
  String get statutLibelle {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'confirmee':
        return 'Confirmée';
      case 'en_preparation':
        return 'En préparation';
      case 'en_livraison':
        return 'En livraison';
      case 'livree':
        return 'Livrée';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  }

  // Couleur du statut
  String get statutColor {
    switch (statut) {
      case 'en_attente':
        return 'warning';
      case 'confirmee':
      case 'en_preparation':
        return 'info';
      case 'en_livraison':
        return 'primary';
      case 'livree':
        return 'success';
      case 'annulee':
        return 'error';
      default:
        return 'default';
    }
  }

  // Peut être annulée
  bool get peutEtreAnnulee {
    return statut == 'en_attente' || statut == 'confirmee';
  }

  // Copy with
  CommandeModel copyWith({
    int? id,
    int? clientId,
    String? numeroCommande,
    double? montantTotal,
    String? statut,
    String? adresseLivraison,
    String? telephoneLivraison,
    String? notesLivraison,
    String? modePaiement,
    String? statutPaiement,
    String? transactionId,
    DateTime? dateLivraison,
    String? clientNom,
    String? clientPrenom,
    String? clientEmail,
    List<CommandeItemModel>? items,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CommandeModel(
      id: id ?? this.id,
      clientId: clientId ?? this.clientId,
      numeroCommande: numeroCommande ?? this.numeroCommande,
      montantTotal: montantTotal ?? this.montantTotal,
      statut: statut ?? this.statut,
      adresseLivraison: adresseLivraison ?? this.adresseLivraison,
      telephoneLivraison: telephoneLivraison ?? this.telephoneLivraison,
      notesLivraison: notesLivraison ?? this.notesLivraison,
      modePaiement: modePaiement ?? this.modePaiement,
      statutPaiement: statutPaiement ?? this.statutPaiement,
      transactionId: transactionId ?? this.transactionId,
      dateLivraison: dateLivraison ?? this.dateLivraison,
      clientNom: clientNom ?? this.clientNom,
      clientPrenom: clientPrenom ?? this.clientPrenom,
      clientEmail: clientEmail ?? this.clientEmail,
      items: items ?? this.items,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Modèle Item de Commande
class CommandeItemModel {
  final int id;
  final int commandeId;
  final int produitId;
  final String produitNom;
  final int quantite;
  final double prixUnitaire;
  final double montantTotal;
  final DateTime createdAt;
  final DateTime updatedAt;

  CommandeItemModel({
    required this.id,
    required this.commandeId,
    required this.produitId,
    required this.produitNom,
    required this.quantite,
    required this.prixUnitaire,
    required this.montantTotal,
    required this.createdAt,
    required this.updatedAt,
  });

  // From JSON
  factory CommandeItemModel.fromJson(Map<String, dynamic> json) {
    return CommandeItemModel(
      id: json['id'] as int,
      commandeId: json['commande_id'] as int,
      produitId: json['produit_id'] as int,
      produitNom: json['produit_nom'] as String,
      quantite: json['quantite'] as int,
      prixUnitaire: double.parse(json['prix_unitaire'].toString()),
      montantTotal: double.parse(json['montant_total'].toString()),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  // To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'commande_id': commandeId,
      'produit_id': produitId,
      'produit_nom': produitNom,
      'quantite': quantite,
      'prix_unitaire': prixUnitaire,
      'montant_total': montantTotal,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
