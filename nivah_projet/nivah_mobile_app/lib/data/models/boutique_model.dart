/// Modèle Boutique
class BoutiqueModel {
  final int id;
  final String nom;
  final String slug;
  final String? description;
  final String? logo;
  final String? banniere;
  final bool actif;
  final bool featured;
  final double? note;
  final int? nombreAvis;
  final DateTime createdAt;
  final DateTime updatedAt;

  BoutiqueModel({
    required this.id,
    required this.nom,
    required this.slug,
    this.description,
    this.logo,
    this.banniere,
    this.actif = true,
    this.featured = false,
    this.note,
    this.nombreAvis,
    required this.createdAt,
    required this.updatedAt,
  });

  // From JSON
  factory BoutiqueModel.fromJson(Map<String, dynamic> json) {
    return BoutiqueModel(
      id: json['id'] as int,
      nom: json['nom'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      logo: json['logo'] as String?,
      banniere: json['banniere'] as String?,
      actif: json['actif'] == true || json['actif'] == 1,
      featured: json['featured'] == true || json['featured'] == 1,
      note: json['note'] != null ? double.parse(json['note'].toString()) : null,
      nombreAvis: json['nombre_avis'] as int?,
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
      'banniere': banniere,
      'actif': actif,
      'featured': featured,
      'note': note,
      'nombre_avis': nombreAvis,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Copy with
  BoutiqueModel copyWith({
    int? id,
    String? nom,
    String? slug,
    String? description,
    String? logo,
    String? banniere,
    bool? actif,
    bool? featured,
    double? note,
    int? nombreAvis,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BoutiqueModel(
      id: id ?? this.id,
      nom: nom ?? this.nom,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      logo: logo ?? this.logo,
      banniere: banniere ?? this.banniere,
      actif: actif ?? this.actif,
      featured: featured ?? this.featured,
      note: note ?? this.note,
      nombreAvis: nombreAvis ?? this.nombreAvis,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
