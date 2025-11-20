/// Modèle utilisateur (Client)
class UserModel {
  final int id;
  final String nom;
  final String prenom;
  final String email;
  final String telephone;
  final String? photo;
  final bool emailVerifie;
  final String statut;
  final DateTime? derniereConnexion;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.email,
    required this.telephone,
    this.photo,
    this.emailVerifie = false,
    this.statut = 'en_attente',
    this.derniereConnexion,
    required this.createdAt,
    required this.updatedAt,
  });

  // From JSON
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      nom: json['nom'] as String,
      prenom: json['prenom'] as String,
      email: json['email'] as String,
      telephone: json['telephone'] as String,
      photo: json['photo'] as String?,
      emailVerifie: json['email_verifie'] == true || json['email_verifie'] == 1 || json['email_verifie'] == '1',
      statut: json['statut'] as String? ?? 'actif',
      derniereConnexion: json['derniere_connexion'] != null
          ? DateTime.parse(json['derniere_connexion'] as String)
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
    );
  }

  // To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom': nom,
      'prenom': prenom,
      'email': email,
      'telephone': telephone,
      'photo': photo,
      'email_verifie': emailVerifie,
      'statut': statut,
      'derniere_connexion': derniereConnexion?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Nom complet
  String get nomComplet => '$prenom $nom';

  // Initiales
  String get initiales {
    String p = prenom.isNotEmpty ? prenom[0].toUpperCase() : '';
    String n = nom.isNotEmpty ? nom[0].toUpperCase() : '';
    return '$p$n';
  }

  // Copy with
  UserModel copyWith({
    int? id,
    String? nom,
    String? prenom,
    String? email,
    String? telephone,
    String? photo,
    bool? emailVerifie,
    String? statut,
    DateTime? derniereConnexion,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      nom: nom ?? this.nom,
      prenom: prenom ?? this.prenom,
      email: email ?? this.email,
      telephone: telephone ?? this.telephone,
      photo: photo ?? this.photo,
      emailVerifie: emailVerifie ?? this.emailVerifie,
      statut: statut ?? this.statut,
      derniereConnexion: derniereConnexion ?? this.derniereConnexion,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
