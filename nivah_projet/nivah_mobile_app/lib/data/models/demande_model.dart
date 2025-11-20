/// Modèle Demande (Support)
class DemandeModel {
  final int id;
  final int clientId;
  final String type;
  final String sujet;
  final String description;
  final String statut;
  final String? pieceJointe;
  final String? reponse;
  final DateTime? dateReponse;
  final String? clientNom;
  final String? clientPrenom;
  final String? clientEmail;
  final String? clientTelephone;
  final DateTime createdAt;
  final DateTime updatedAt;

  DemandeModel({
    required this.id,
    required this.clientId,
    required this.type,
    required this.sujet,
    required this.description,
    this.statut = 'ouverte',
    this.pieceJointe,
    this.reponse,
    this.dateReponse,
    this.clientNom,
    this.clientPrenom,
    this.clientEmail,
    this.clientTelephone,
    required this.createdAt,
    required this.updatedAt,
  });

  // From JSON
  factory DemandeModel.fromJson(Map<String, dynamic> json) {
    return DemandeModel(
      id: json['id'] as int,
      clientId: json['client_id'] as int,
      type: json['type'] as String,
      sujet: json['sujet'] as String,
      description: json['description'] as String,
      statut: json['statut'] as String? ?? 'ouverte',
      pieceJointe: json['piece_jointe'] as String?,
      reponse: json['reponse'] as String?,
      dateReponse: json['date_reponse'] != null
          ? DateTime.parse(json['date_reponse'] as String)
          : null,
      clientNom: json['client_nom'] as String?,
      clientPrenom: json['client_prenom'] as String?,
      clientEmail: json['client_email'] as String?,
      clientTelephone: json['client_telephone'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  // To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'client_id': clientId,
      'type': type,
      'sujet': sujet,
      'description': description,
      'statut': statut,
      'piece_jointe': pieceJointe,
      'reponse': reponse,
      'date_reponse': dateReponse?.toIso8601String(),
      'client_nom': clientNom,
      'client_prenom': clientPrenom,
      'client_email': clientEmail,
      'client_telephone': clientTelephone,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Type lisible
  String get typeLibelle {
    switch (type) {
      case 'question':
        return 'Question';
      case 'reclamation':
        return 'Réclamation';
      case 'suggestion':
        return 'Suggestion';
      case 'probleme_technique':
        return 'Problème technique';
      case 'autre':
        return 'Autre';
      default:
        return type;
    }
  }

  // Statut lisible
  String get statutLibelle {
    switch (statut) {
      case 'ouverte':
        return 'Ouverte';
      case 'en_cours':
        return 'En cours';
      case 'fermee':
        return 'Fermée';
      default:
        return statut;
    }
  }

  // Couleur du statut
  String get statutColor {
    switch (statut) {
      case 'ouverte':
        return 'warning';
      case 'en_cours':
        return 'info';
      case 'fermee':
        return 'success';
      default:
        return 'default';
    }
  }

  // Est résolue
  bool get estResolue => statut == 'fermee' && reponse != null;

  // Copy with
  DemandeModel copyWith({
    int? id,
    int? clientId,
    String? type,
    String? sujet,
    String? description,
    String? statut,
    String? pieceJointe,
    String? reponse,
    DateTime? dateReponse,
    String? clientNom,
    String? clientPrenom,
    String? clientEmail,
    String? clientTelephone,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return DemandeModel(
      id: id ?? this.id,
      clientId: clientId ?? this.clientId,
      type: type ?? this.type,
      sujet: sujet ?? this.sujet,
      description: description ?? this.description,
      statut: statut ?? this.statut,
      pieceJointe: pieceJointe ?? this.pieceJointe,
      reponse: reponse ?? this.reponse,
      dateReponse: dateReponse ?? this.dateReponse,
      clientNom: clientNom ?? this.clientNom,
      clientPrenom: clientPrenom ?? this.clientPrenom,
      clientEmail: clientEmail ?? this.clientEmail,
      clientTelephone: clientTelephone ?? this.clientTelephone,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
