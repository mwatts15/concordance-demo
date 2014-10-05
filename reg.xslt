<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
>

<xsl:template match="text">
    <html>
        <head><title>A list of books, transformed into html from xml using xslt and jython.</title></head>
        <body>
            <table border="1" width="50%" align="center">
                <caption><xsl:value-of select="head/text()"/></caption>
                <tr><th>Line</th><th>Text</th></tr>
                <xsl:for-each select="body/l">
                    <tr><td><xsl:value-of select="@n"/></td><td><xsl:value-of select="text()"/></td></tr>
                </xsl:for-each>
            </table>
            <table border="1" width="50%" align="center">
                <caption>Concordance</caption>
                <tr><th>Lines</th><th>Note</th></tr>
                <xsl:for-each select="spanGrp/span">
                    <tr><td><xsl:value-of select="@from"/>
                            <xsl:if test="@to">-<xsl:value-of select="@to"/></xsl:if>
                        </td>
                        <td><xsl:value-of select="text()" />
                        </td>
                    </tr>
                </xsl:for-each>
            </table>
        </body>
    </html>
</xsl:template>

</xsl:stylesheet>
