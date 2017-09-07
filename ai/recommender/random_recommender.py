"""
Recommender system for Penn AI.
"""
import pandas as pd
from .base import BaseRecommender
import numpy as np
import pdb

class RandomRecommender(BaseRecommender):
    """Penn AI random recommender.

    Recommends random machine learning algorithms and parameters from the
    results.

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.

    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.

    """

    def __init__(self, ml_type='classifier', metric=None):
        """Initialize recommendation system."""
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type

        if metric is None:
            self.metric = 'accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric

        # ml p options
        self.ml_p = []

        # number of datasets trained on so far
        self.w = 0

        # maintain a set of dataset-algorithm-parameter combinations that have already been evaluated
        self.trained_dataset_models = set()

    def update(self, results_data):
        """Update ML / Parameter recommendations based on overall performance in results_data.

        Updates self.scores

        Parameters
        ----------
        results_data: DataFrame with columns corresponding to:
                'dataset'
                'algorithm'
                'parameters'
                self.metric
        """
        # make combined data columns of datasets, classifiers, and parameters
        results_data.loc[:, 'algorithm-parameters'] = (
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        results_data.loc[:, 'dataset-algorithm-parameters'] = (
                                       results_data['dataset'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        # get unique dataset / parameter / classifier combos in results_data
        self.ml_p = results_data['algorithm-parameters'].unique()
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)


    def recommend(self, dataset_id=None, n_recs=1):
        """Return a model and parameter values expected to do best on dataset.

        Parameters
        ----------
        dataset_id: string
            ID of the dataset for which the recommender is generating recommendations.
        n_recs: int (default: 1), optional
            Return a list of length n_recs in order of estimators and parameters expected to do best.
        """

        # return ML+P for best average y
        #print(self.ml_p)
        try:
            rec = np.random.choice(self.ml_p,size=n_recs,replace=False)
            # if a dataset is specified, do not make recommendations for
            # algorithm-parameter combos that have already been run
            if dataset_id is not None:
                rec = [r for r in rec if dataset_id + '|' + r not in
                       self.trained_dataset_models]

            ml_rec = [r.split('|')[0] for r in rec]
            p_rec = [r.split('|')[1] for r in rec]
            rec_score = [0 for r in rec]
        except AttributeError:
            print('rec:', rec)
            print('self.scores:', self.scores)
            print('self.w:', self.w)
            raise AttributeError

        # update the recommender's memory with the new algorithm-parameter combos that it recommended
        ml_rec = ml_rec[:n_recs]
        p_rec = p_rec[:n_recs]
        rec_score = rec_score[:n_recs]

        if dataset_id is not None:
            self.trained_dataset_models.update(
                                        ['|'.join([dataset_id, ml, p])
                                        for ml, p in zip(ml_rec, p_rec)])

        return ml_rec, p_rec, rec_score