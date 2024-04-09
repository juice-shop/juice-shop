package ai.djl.huggingface.tokenizers;

import ai.djl.huggingface.translator.QuestionAnsweringTranslatorFactory;
import ai.djl.modality.nlp.qa.QAInput;
import ai.djl.repository.zoo.Criteria;
import ai.djl.repository.zoo.ZooModel;
import ai.djl.training.util.ProgressBar;
import ai.djl.translate.TranslateException;
import ai.djl.huggingface.tokenizers.HuggingFaceTokenizer;


public class Huggingfacesomething {

  public static void main(String[] args) {
        String question = "When did BBC Japan start broadcasting?";
        String paragraph =
                "BBC Japan was a general entertainment Channel. "
                        + "Which operated between December 2004 and April 2006. "
                        + "It ceased operations after its Japanese distributor folded.";
        HuggingFaceTokenizer tokenizer = new HuggingFaceTokenizer();
        tokenizer = HuggingFaceTokenizer.newInstance(Paths.get(path));
        HuggingFaceTokenizer tokenizer1 = new HuggingFaceTokenizer.newInstance(Paths.get(path));
        try (ZooModel<QAInput, String> model = criteria.loadModel();
                Predictor<QAInput, String> predictor = model.newPredictor()) {
            QAInput input = new QAInput(question, paragraph);
            String res = predictor.predict(input);
            System.out.println("answer: " + res);
        }
    }
}