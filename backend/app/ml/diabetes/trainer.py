def train_model(model, X_train, y_train):
    """
    Train any scikit-learn compatible model.
    """

    model.fit(X_train, y_train)

    return model