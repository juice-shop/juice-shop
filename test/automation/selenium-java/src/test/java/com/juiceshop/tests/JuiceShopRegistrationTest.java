mport org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.Duration;

public class JuiceShopRegistrationTest {

    WebDriver driver;
    WebDriverWait wait;

    @BeforeMethod
    private void setUP() {

        driver = new EdgeDriver();
        driver.manage().window().maximize();
        driver.get("https://juice-shop.herokuapp.com/#/");
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @Test
    private void testSuccessfulUserRegistration() {
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[aria-label='Close Welcome Banner']"))).click();
        wait.until(ExpectedConditions.elementToBeClickable(By.id("navbarAccount"))).click();
        wait.until(ExpectedConditions.elementToBeClickable(By.id("navbarLoginButton"))).click();
        WebElement regLink = driver.findElement(By.cssSelector(".primary-link[routerlink='/register']"));
        JavascriptExecutor Js = (JavascriptExecutor)driver;
        Js.executeScript("arguments[0].click();",regLink);
       // wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".primary-link[routerlink='/register']"))).click();
        Assert.assertTrue(driver.getCurrentUrl().contains("register"), "fail to navigate to registration page ");
        Assert.assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div[class='mdc-card']"))).isDisplayed());
        driver.findElement(By.id("emailControl")).sendKeys("script@test.com");
        driver.findElement(By.id("passwordControl")).sendKeys("Password123!");
        driver.findElement(By.id("repeatPasswordControl")).sendKeys("Password123!");
        driver.findElement(By.name("securityQuestion")).click();
        wait.until(ExpectedConditions.elementToBeClickable(By.xpath("(//mat-option)[7]]"))).click();
        driver.findElement(By.id("securityAnswerControl")).sendKeys("secret answer");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("registerButton"))).click();
        Assert.assertTrue(wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("mat-simple-snackbar-action-0"), "Registration completed successfully")));
    }

    @AfterMethod
    private void tearDown(){
        driver.quit();
    }
}
