import 'produit_model.dart';

/// Modèle Item du Panier
class CartItemModel {
  final int id;
  final int clientId;
  final int produitId;
  final int quantite;
  final double prixUnitaire;
  final ProduitModel? produit;
  final DateTime createdAt;
  final DateTime updatedAt;

  CartItemModel({
    required this.id,
    required this.clientId,
    required this.produitId,
    required this.quantite,
    required this.prixUnitaire,
    this.produit,
    required this.createdAt,
    required this.updatedAt,
  });

  // From JSON
  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      id: json['id'] as int,
      clientId: json['client_id'] as int,
      produitId: json['produit_id'] as int,
      quantite: json['quantite'] as int,
      prixUnitaire: double.parse(json['prix_unitaire'].toString()),
      produit: json['produit'] != null
          ? ProduitModel.fromJson(json['produit'] as Map<String, dynamic>)
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
      'produit_id': produitId,
      'quantite': quantite,
      'prix_unitaire': prixUnitaire,
      'produit': produit?.toJson(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Montant total de l'item
  double get montantTotal => prixUnitaire * quantite;

  // Copy with
  CartItemModel copyWith({
    int? id,
    int? clientId,
    int? produitId,
    int? quantite,
    double? prixUnitaire,
    ProduitModel? produit,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CartItemModel(
      id: id ?? this.id,
      clientId: clientId ?? this.clientId,
      produitId: produitId ?? this.produitId,
      quantite: quantite ?? this.quantite,
      prixUnitaire: prixUnitaire ?? this.prixUnitaire,
      produit: produit ?? this.produit,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
