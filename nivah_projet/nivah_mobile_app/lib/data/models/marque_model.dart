/// Modèle Marque
class MarqueModel {
  final int id;
  final String nom;
  final String slug;
  final String? description;
  final String? logo;
  final bool actif;
  final DateTime createdAt;
  final DateTime updatedAt;

  MarqueModel({
    required this.id,
    required this.nom,
    required this.slug,
    this.description,
    this.logo,
    this.actif = true,
    required this.createdAt,
    required this.updatedAt,
  });

  // From JSON
  factory MarqueModel.fromJson(Map<String, dynamic> json) {
    return MarqueModel(
      id: json['id'] as int,
      nom: json['nom'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      logo: json['logo'] as String?,
      actif: json['actif'] == true || json['actif'] == 1,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  // To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom': nom,
      'slug': slug,
      'description': description,
      'logo': logo,
      'actif': actif,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Copy with
  MarqueModel copyWith({
    int? id,
    String? nom,
    String? slug,
    String? description,
    String? logo,
    bool? actif,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return MarqueModel(
      id: id ?? this.id,
      nom: nom ?? this.nom,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      logo: logo ?? this.logo,
      actif: actif ?? this.actif,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
